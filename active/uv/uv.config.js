self.__uv$config = {
    prefix: '/active/go/',
    bare:'https://bare.benrogo.net',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: 'https://gimkit0.github.io/uv-static/active/uv/uv.handler.js',
    bundle: 'https://gimkit0.github.io/uv-static/active/uv/uv.bundle.js',
    config: 'https://gimkit0.github.io/uv-static/active/uv/uv.config.js',
    sw: 'https://gimkit0.github.io/uv-static/active/uv/uv.sw.js',
};
