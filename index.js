var phantomjs = require('phantomjs-prebuilt');
var webdriverio = require('webdriverio');
var wdOpts = { capabilities: { browserName: 'chrome' } };
const fs = require('fs');

const outputName = `${process.env.CORRETOR_CITY}.json`;

const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const sleep = async (ms) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const main = async () => {
  const browser = await webdriverio.remote({
    capabilities: { browserName: 'chrome' },
  });

  await browser.navigateTo(
    `https://www.crecisp.gov.br/cidadao/listadecorretores`
  );
  await browser.waitUntil(
    async () =>
      (await browser.getUrl()) ===
      'https://www.crecisp.gov.br/cidadao/listadecorretores',
    {
      timeout: 5000000,
    }
  );

  const corretores = [];

  for (let j = 0; j < letters.length; j++) {
    const currentLetter = letters[j];
    let currentPageNumber = 0;

    while (true) {
      const currentListPage = `https://www.crecisp.gov.br/cidadao/listadecorretores?page=${currentPageNumber}&firstLetter=${currentLetter}`;
      await browser.navigateTo(currentListPage);
      const pageToReturn = currentListPage;

      const cards = await browser.$$('.broker-details');
      if (cards.length === 0) break;

      console.log('cards', cards.length);

      for (let i = 0; i < cards.length; i++) {
        console.log('init loop');
        const detailsButtons = await browser.$$('.broker-details button');
        console.log('detailButtons');
        const detailsButton = detailsButtons[i];

        await detailsButton.click();

        try {
          const newCorretor = {};

          const name = await browser.$('.col-sm-9 h3');

          newCorretor.name = await name.getText();

          try {
            if (await browser.$('label[for="RegisterNumber"]').isExisting()) {
              const creci = await browser.$(function () {
                return this.document.querySelector(
                  'label[for="RegisterNumber"]'
                ).parentElement.nextElementSibling;
              });

              newCorretor.creci = await creci.getText();
            }
          } catch {}

          try {
            if (await browser.$('label[for="SecondaryMail"]').isExisting()) {
              const email = await browser.$(function () {
                return this.document.querySelector(
                  'label[for="SecondaryMail"]'
                ).parentElement.nextElementSibling;
              });

              newCorretor.email = await email.getText();
            }
          } catch {}

          try {
            if (await browser.$('label[for="RegisterDate"]').isExisting()) {
              const registerDate = await browser.$(function () {
                return this.document.querySelector(
                  'label[for="RegisterDate"]'
                ).parentElement.nextElementSibling;
              });

              newCorretor.registerDate = await registerDate.getText();
            }
          } catch {}

          try {
            if (
              await browser.$('label[for="RegistrationStatus"]').isExisting()
            ) {
              const registrationStatus = await browser.$(function () {
                return this.document.querySelector(
                  'label[for="RegistrationStatus"]'
                ).parentElement.nextElementSibling;
              });

              newCorretor.registrationStatus =
                await registrationStatus.getText();
            }
          } catch {}

          try {
            newCorretor.phones = [];
            if (await browser.$('h3=Telefones').isExisting()) {
              const phonesContainer = await (
                await (await browser.$('h3=Telefones')).$('..')
              ).$('..');

              const phone1 = await phonesContainer.$(function () {
                return this.nextElementSibling.querySelector('span');
              });
              newCorretor.phones.push(await phone1.getText());

              try {
                const hasPhone2 = await element.executeScript((elem) => {
                  return elem.nextElementSibling !== null;
                });

                if (hasPhone2) {
                  const phone2 = await phone1.$(function () {
                    return this.nextElementSibling.querySelector('span');
                  });
                  newCorretor.phones.push(await phone2.getText());
                }
              } catch {}
            }
          } catch {}

          console.log('🎃', newCorretor);
          corretores.push(newCorretor);
        } catch {
          console.log('caiu no catch');
        }

        console.log('back');
        // await browser.back();
        await browser.navigateTo(pageToReturn);
        console.log('end loop');
      }

      currentPageNumber++;
    }
  }

  saveJson(corretores);

  console.log('Acabou');
};

main()
  .then(() => {
    console.log('Acabou');
  })
  .catch((err) => {
    console.log('Deu pau', err);
  });

const saveJson = (object) => {
  fs.writeFile(outputName, JSON.stringify(object), 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.');
      return console.log(err);
    }

    console.log('JSON file has been saved.');
  });
};
