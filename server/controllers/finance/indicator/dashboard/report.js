/**
 * @overview
 * indicator Reports
 *
 * @description
 * report for indicators(staff, hospitalization and finances)
 *
 * @todo - implement the filtering portion of this.  See patient registrations
 * for inspiration.
 */

const _ = require('lodash');
const moment = require('moment');
const process = require('./process');
const ReportManager = require('../../../../lib/ReportManager');

const REPORT_TEMPLATE = './server/controllers/finance/indicator/dashboard/report.handlebars';

exports.report = report;

/**
 * @function report
 * @desc build a report for invoice patient report of metadata
 * @param {array} data invoice patient report of metadata
 * @return {object} promise
 */
function report(req, res, next) {
  let reportInstance;

  const query = _.clone(req.query);
  const options = req.query;
  const data = { display : {} };

  _.extend(query, {
    filename : 'INVOICE_REGISTRY.TITLE',
    csvKey : 'rows',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  const indicatorTypes = ['finances', 'hospitalization', 'staff'];

  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
  } catch (e) {
    next(e);
    return;
  }

  lookupIndicators(options)
    .then(result => {
      if (options.type) { // a specific indicator type is defined
        data.display[options.type] = true; // only this type of indicator will be displayed
        indicatorTypes.forEach(tp => {
          if (options.type !== tp) {
            data.display[tp] = false;
          }
        });
      } else {
        indicatorTypes.forEach(tp => {
          data.display[tp] = true;
        });
      }
      data.indicators = result.indicators;
      data.dateFrom = options.dateFrom;
      data.dateTo = options.dateTo;

      return reportInstance.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

async function lookupIndicators(options) {
  options.dateFrom = moment(options.dateFrom).format('YYYY-MM-DD');
  options.dateTo = moment(options.dateTo).format('YYYY-MM-DD');
  return process.processIndicators(options);
}
