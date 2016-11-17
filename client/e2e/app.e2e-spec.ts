import { SprinklerPage } from './app.po';

describe('sprinkler App', function() {
  let page: SprinklerPage;

  beforeEach(() => {
    page = new SprinklerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
