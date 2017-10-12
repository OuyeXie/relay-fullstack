import deb from 'debug';

const debug = deb('treasure');

function getCoefficient(discountRate, growthRate, totalNumberOfYears) {
  return (1 + growthRate) *
    ((Math.pow(1 + discountRate, 1 + totalNumberOfYears) - Math.pow(1 + growthRate, 1 + totalNumberOfYears)) /
      (Math.pow(1 + discountRate, 1 + totalNumberOfYears) * (discountRate - growthRate)));
}

/*
 * calculate present value according to PV = (CF1/(1+r1)) + (CF2/(1+r2)^2) + ...
 * PV(0-N) = CF(0) * (1+g) * ((1+r)^(N+1) - (1+g)^(N+1) / ((1+r)^(N+1) * (r-g)))
 * PV(n-N) = CF(n) * (1+g) * ((1+r)^(N+1) - (1+g)^(N+1) / ((1+r)^(N+1) * (r-g))) // N = N-n
 * CF(n) = CF(0) * (1+g)^n/(1+r)^n
 * PV(0-n) = PV(0-N) - PV(n-N) - NOA
 *
 * @param cashFlow Double
 * @param discountRate Double
 * @param growthRate Double
 * @param numberOfYears Integer
 * @param nonOperationAssets Integer
 */
export function calculateBeforeYear(cashFlow, discountRate, growthRate, nonOperationAssets = 0, totalNumberOfYears = 1000, numberOfYears = 30) {
  if (totalNumberOfYears > 10000) {
    debug('totalNumberOfYears cannot be greater than 10000');
    return 0;
  }
  const cashFlowInEndYear = cashFlow * ((Math.pow(1 + growthRate, numberOfYears)) / (Math.pow(1 + discountRate, numberOfYears)));
  const coefficient1 = getCoefficient(discountRate, growthRate, totalNumberOfYears);
  const coefficient2 = getCoefficient(discountRate, growthRate, totalNumberOfYears - numberOfYears);
  const presentValueAll = cashFlow * coefficient1;
  const presentValueAfterEndYear = cashFlowInEndYear * coefficient2;
  const presentValueBeforeEndYear = presentValueAll - presentValueAfterEndYear - nonOperationAssets;
  return presentValueBeforeEndYear;
}

/*
 * calculate present value according to PV = (CF1/(1+r1)) + (CF2/(1+r2)^2) + ...
 * PV(0-N) = CF(0) * (1+g) * ((1+r)^(N+1) - (1+g)^(N+1) / ((1+r)^(N+1) * (r-g)))
 * PV(0-n) = PV(0-N) - NOA
 *
 * @param cashFlow Double
 * @param discountRate Double
 * @param growthRate Double
 * @param numberOfYears Integer
 * @param nonOperationAssets Integer
 */
export function calculate(cashFlow, discountRate, growthRate, nonOperationAssets = 0, totalNumberOfYears = 1000) {
  if (totalNumberOfYears > 10000) {
    debug('totalNumberOfYears cannot be greater than 10000');
    return 0;
  }
  const coefficient = getCoefficient(discountRate, growthRate, totalNumberOfYears);
  const presentValueAll = cashFlow * coefficient;
  const presentValueBeforeEndYear = presentValueAll - nonOperationAssets;
  return presentValueBeforeEndYear;
}

export function getMarketRate() {
  return {
    cashFlow: 3000.0 * 12,
    discountRate: 0.05,
    growthRate: 0.03,
    nonOperationAssets: 0.0,
    totalNumberOfYears: 1000,
    numberOfYears: 30,
  };
}

export default {};
