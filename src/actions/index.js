import mitt from 'mitt';
const actions = {
  test: (e) => console.log('foo', e),
};

const emitter = mitt();
for (const key in actions) {
  emitter.on(key, actions[key]);
}

export default emitter;
