// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('VillageController', VillageController);

VillageController.$inject = [
  'LocationService', '$window', '$translate'
];

function VillageController(Locations, $window, $translate) {
  var vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.create = create;
  vm.submit = submit;
  vm.update = update;
  vm.cancel = cancel;


  vm.loadProvinces = loadProvinces;
  vm.loadSectors = loadSectors;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;

    // load Villages
    refreshVillages();
  }

  function cancel() {
    vm.view = 'default';
  }

  function create() {
    vm.view = 'create';
    vm.village = {};
  }

  vm.messages = {
    country : Locations.messages.country,
    province : Locations.messages.province,
    sector : Locations.messages.sector
  };

  /** load countries on startup */
  Locations.countries()
  .then(function (countries) {

    // bind the countries to the view for <select>ion
    vm.countries = countries;

    // make sure that we are showing the proper message to the client
    vm.messages.country = (countries.length > 0) ?
      Locations.messages.country :
      Locations.messages.empty;
  });

  /** loads provinces based on the selected country */
  function loadProvinces() {

    // make sure we do not make unnecessary HTTP requests
    if (!vm.village.country_uuid) { return; }

    Locations.provinces({ country : vm.village.country_uuid })
    .then(function (provinces) {

      // bind the provinces to the view for <select>ion
      vm.provinces = provinces;

      // make sure that we show the correct message in the <select> option
      vm.messages.province = (provinces.length > 0) ?
        Locations.messages.province :
        Locations.messages.empty;
    });
  }

  /** loads sectors based on the selected province */
  function loadSectors() {

    // make sure we do not make unnecessary HTTP requests
    if (!vm.village.province_uuid) { return; }

    Locations.sectors({ province : vm.village.province_uuid })
    .then(function (sectors) {

      // bind the sectors to the view for <select>ion
      vm.sectors = sectors;

      // make sure that we show the correct message in the <select> option
      vm.messages.sector = (sectors.length > 0) ?
        Locations.messages.sector :
        Locations.messages.empty;
    });
  }

  // switch to update mode
  // data is an object that contains all the information of a village
  function update(data) {
    vm.view = 'update';
    vm.village = data;
    vm.village.name = data.village;
    vm.village.uuid = data.villageUuid;
    vm.village.sector_uuid = data.sectorUuid;
    vm.village.province_uuid = data.provinceUuid;
    vm.village.country_uuid = data.countryUuid;
    loadProvinces();
    loadSectors();
  }

  
  // refresh the displayed Villages
  function refreshVillages() {
    return Locations.locations().then(function (data) {
      vm.locations = data;
      vm.session.loading = false;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');
    var village = angular.copy(vm.village);
    
    promise = (creation) ?
      Locations.create.village(village) :
      Locations.update.village(village.uuid, village);

    promise
      .then(function (response) {
        return refreshVillages();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  startup();  
}