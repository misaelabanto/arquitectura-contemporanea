import { writeFileSync } from 'fs';
import { Page, chromium } from 'playwright';
import { URLSearchParams } from 'url';
let page: Page;
const placesData: PlaceData[] = [];

interface PlaceData {
  name: string;
  latitude: number;
  longitude: number;
  contentUrl: string;
}

async function init() {
  const browser = await chromium.launch({ headless: false });
  page = await browser.newPage();
  await page.goto('https://arquitecturacontemporanealima.blogspot.com/');
}

async function getPlaceData(name: string, href: string): Promise<PlaceData> {
  await page.goto(href);
  const iframeSelector = '#main-wrapper iframe'
  try {
    await page.waitForSelector(iframeSelector, { state: 'attached', timeout: 2000 })
    const iframe = await page.$$(iframeSelector);
    const mapUrl = await iframe[0].getAttribute('src') as string;
    const url = new URLSearchParams(mapUrl);
    const coords = url.get('ll')?.replace(/\n+/, '').split(',');
    return {
      name,
      latitude: Number(coords?.[0]),
      longitude: Number(coords?.[1]),
      contentUrl: href,
    }
  } catch (e) {
    console.error(e);
  }
}

function savePlacesData() {
  writeFileSync('client/data.json', JSON.stringify(placesData), { encoding: 'utf-8', flag: 'w' });
}

async function getPlaces() {
  const places = await page.$$('#post-body-2147696724990960934 > a');
  const hrefs = [];
  for(let place of places) {
    const href = await place.getAttribute('href');
    const name = await place.innerText();
    hrefs.push({name, href});
  }
  for (let href of hrefs) {
    const placeData = await getPlaceData(href.name, href.href);
    console.log(placeData);
    placesData.push(placeData);
  }
}

async function main() {
  await init();
  await getPlaces();
  savePlacesData();
}

main();