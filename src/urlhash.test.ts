import LayerSwitcher from '.';
import URLHash, { HashComponents, decodeHash, encodeHash } from './urlhash';

test('decodeHash', () => {
  expect(decodeHash('#10/51.505/-0.09')).toStrictEqual({
    center: [-0.09, 51.505],
    zoom: 10,
    layers: '',
    additional: {},
  });

  expect(decodeHash('#10/51.505/-0.09/A,B,C')).toStrictEqual({
    center: [-0.09, 51.505],
    zoom: 10,
    layers: 'A,B,C',
    additional: {},
  });
});

test('Test hash encoding round trip', () => {
  let components: HashComponents = { additional: {} };
  expect(decodeHash(encodeHash(components))).toStrictEqual(components);

  components.center = [-0.09, 51.505];
  components.zoom = 10;
  components.layers = '';
  expect(decodeHash(encodeHash(components))).toStrictEqual(components);

  components.layers = 'A,B,C';
  expect(decodeHash(encodeHash(components))).toStrictEqual(components);

  components.additional = { foo: 'bar', a: 'b' };
  expect(decodeHash(encodeHash(components))).toStrictEqual(components);
});

test('test URLHash class', () => {
  let layer_switcher = new LayerSwitcher({}, []);
  let url_hash = new URLHash(layer_switcher);

  let returned_value = null;
  url_hash.registerHandler('a', (value) => {
    returned_value = value;
  });

  url_hash._onHashChange('#10/51.505/-0.09/a=foo');

  expect(returned_value).toBe('foo');
});
