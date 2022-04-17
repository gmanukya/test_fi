
const rideTimeRegex = {
  "FR": new RegExp('time".*?>(?<time>.*?)<.*?class="address".*?>(?<address>.*?)<','gms'),
  "CH": new RegExp('class="rideTime.*?>(?<time>.*?)<\/span>(?<address>.*?)<','gms')
}

const totalPriceRegex = {
  "FR": new RegExp('final-charge.*?>(?<price>.*?)<','ms'),
  "CH": new RegExp('totalPrice chargedFare.*?>(?<price>.*?)<','ms')
}

const timeFeeRegex = {
  "FR": new RegExp('Temps.*?class="price.*?>(?<timeFee>.*?)<','ms'),
  "CH": new RegExp('Temps.*?class="fareText.*?>(?<timeFee>.*?)<','ms')
}

const distanceFeeRegex = {
  "FR": new RegExp('Distance.*?class="price.*?>(?<distanceFee>.*?)<','ms'),
  "CH": new RegExp('Distance.*?class="fareText.*?>(?<distanceFee>.*?)<','ms')
}

const tripInfoRegex = {
  "FR": new RegExp('"label".*?>(?<key>.*?)<.*?class="data.*?>(?<value>.*?)<','gms'),
  "CH": new RegExp('tripInfo .*?>(?<value>.*?)<.*?class="tripInfoDescription.*?>(?<key>.*?)<','gms')
}

const priceValueRegex = new RegExp('(?<price>[0-9]+[,.][0-9]+)','ms');
const priceCurrencyRegex = new RegExp('(?<currency>[^0-9_,. ]+)','ms');

function formatString(string, isTime) {
  let formatedString = ""

  if (string) {
    formatedString = string.replace(/\s+/g, ' ').trim()

    if (isTime && formatedString.match(/^[0-9]{1}:[0-9]{2}/g)) {
      formatedString = "0" + formatedString
    }
  }

  return formatedString
}

function getCurrencySymbol(priceString) {
  let symbolsDict = {
    "€": "EUR",
    "CHF": "CHF"
  }
  
  if (priceString) {
    let currency = formatString(priceString)
    return symbolsDict[currency]
  }

  return ""
}

function parseFloatValue(string) {
  if (string) {
    let formatedString = formatString(string)
    return parseFloat(formatedString.replace(",", '.'))
  }

  return 0
}

function parseSample(sample) {
  if (!sample || !sample.html || !sample.headers) {
    return "invalid sample"
  }

  const html = sample.html
  const from = sample.headers.from

  let type = "FR", distance, duration

  if (from.match(/suisse/)) {
    type = "CH";
    [distance, duration] = html.matchAll(tripInfoRegex[type]);
  } else {
    [, distance, duration] = html.matchAll(tripInfoRegex[type])
  }

  let [departureData, arrivalData] = html.matchAll(rideTimeRegex[type])  
  let price = totalPriceRegex[type].exec(html)?.groups.price
  let distanceFee = distanceFeeRegex[type].exec(html)?.groups.distanceFee
  let timeFee = timeFeeRegex[type].exec(html)?.groups.timeFee
  
  return {
    arrivalAddress: formatString(arrivalData.groups.address),
    arrivalTime: formatString(arrivalData.groups.time, true).replace(/[\s\|]+/g, ''),
    currency: getCurrencySymbol(priceCurrencyRegex.exec(price)?.groups.currency),
    departureAddress: formatString(departureData.groups.address),
    departureTime: formatString(departureData.groups.time, true).replace(/[\s\|]+/g, ''),
    distance: parseFloatValue(distance?.groups.value),
    distanceFee: parseFloatValue(priceValueRegex.exec(distanceFee)?.groups.price),
    distanceUnit: formatString(distance?.groups.key),
    duration: formatString(duration?.groups.value),
    timeFee: parseFloatValue(priceValueRegex.exec(timeFee)?.groups.price),
    totalPricePaid: parseFloatValue(priceValueRegex.exec(price)?.groups.price),
  }
}

exports.parseSample = parseSample;
