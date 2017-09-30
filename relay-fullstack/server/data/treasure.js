/*
 * calculate present value according to PV = (CF1/(1+r1)) + (CF2/(1+r2)^2) + ...
 * PV(0-N) = CF(0) * (1+g)/(r-g)
 * PV(n-N) = CF(n) * (1+g)/(r-g)
 * CF(n) = CF(0) * (1+g)^n/(1+r)^n
 * PV(0-n) = PV(0-N) - PV(n-N) - NOA
 *
 * @param cashFlow Double
 * @param discountRate Double
 * @param growthRate Double
 * @param numberOfYears Integer
 * @param nonOperationAssets Integer
 */
export function calculateBeforeYear(cashFlow, discountRate, growthRate, numberOfYears = 99, nonOperationAssets = 0) {
  const cashFlowInEndYear = cashFlow * ((Math.pow(1 + growthRate, numberOfYears)) / (Math.pow(1 + discountRate, numberOfYears)));
  const presentValueAll = cashFlow * ((1 + growthRate) / (discountRate - growthRate));
  const presentValueAfterEndYear = cashFlowInEndYear * ((1 + growthRate) / (discountRate - growthRate));
  const presentValueBeforeEndYear = presentValueAll - presentValueAfterEndYear - nonOperationAssets;
  return presentValueBeforeEndYear;
}

/*
 * calculate present value according to PV = (CF1/(1+r1)) + (CF2/(1+r2)^2) + ...
 * PV(0-N) = CF(0) * (1+g)/(r-g)
 * PV(0-n) = PV(0-N) - NOA
 *
 * @param cashFlow Double
 * @param discountRate Double
 * @param growthRate Double
 * @param numberOfYears Integer
 * @param nonOperationAssets Integer
 */
export function calculate(cashFlow, discountRate, growthRate, nonOperationAssets = 0) {
  const presentValueAll = cashFlow * ((1 + growthRate) / (discountRate - growthRate));
  const presentValueBeforeEndYear = presentValueAll - nonOperationAssets;
  return presentValueBeforeEndYear;
}

export default {};
