const teardown = () => {
  (global as any)['__SERVER__'].kill();
};

export default teardown;
