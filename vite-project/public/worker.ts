self.addEventListener('message', (info: MessageEvent<{ type: string, payload: any }>) => {
    const type = info.type;
    console.log(type);
    console.log(info.data);

    self.postMessage('return hello');
});