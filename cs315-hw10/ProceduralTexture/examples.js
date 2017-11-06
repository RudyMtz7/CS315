var generated = document.getElementById("generated");
var examples = [];
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.XOR().tint(1, 0.5, 0.7))
        .add(new TG.SinX().frequency(0.004).tint(0.25, 0, 0))
        .sub(new TG.SinY().frequency(0.004).tint(0.25, 0, 0))
        .add(new TG.SinX().frequency(0.0065).tint(0.1, 0.5, 0.2))
        .add(new TG.SinY().frequency(0.0065).tint(0, 0.4, 0.5))
        .add(new TG.Noise().tint(0.1, 0.1, 0.2))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().offset(-16).frequency(0.03).tint(0.1, 0.25, 0.5))
        .add(new TG.SinY().offset(-16).frequency(0.03).tint(0.1, 0.25, 0.5))
        .add(new TG.Number().tint(0.75, 0.5, 0.5))
        .add(new TG.SinX().frequency(0.03).tint(0.2, 0.2, 0.2))
        .add(new TG.SinY().frequency(0.03).tint(0.2, 0.2, 0.2))
        .add(new TG.Noise().tint(0.1, 0, 0))
        .add(new TG.Noise().tint(0, 0.1, 0))
        .add(new TG.Noise().tint(0, 0, 0.1))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.1))
        .mul(new TG.SinX().frequency(0.05))
        .mul(new TG.SinX().frequency(0.025))
        .mul(new TG.SinY().frequency(0.1))
        .mul(new TG.SinY().frequency(0.05))
        .mul(new TG.SinY().frequency(0.025))
        .add(new TG.SinX().frequency(0.004).tint(-0.25, 0.1, 0.6))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.XOR())
        .mul(new TG.OR().tint(0.5, 0.8, 0.5))
        .mul(new TG.SinX().frequency(0.0312))
        .div(new TG.SinY().frequency(0.0312))
        .add(new TG.SinX().frequency(0.004).tint(0.5, 0, 0))
        .add(new TG.Noise().tint(0.1, 0.1, 0.2))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.01))
        .mul(new TG.SinY().frequency(0.0075))
        .add(new TG.SinX().frequency(0.0225))
        .mul(new TG.SinY().frequency(0.015))
        .add(new TG.Noise().tint(0.1, 0.1, 0.3))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.05))
        .mul(new TG.SinX().frequency(0.08))
        .add(new TG.SinY().frequency(0.05))
        .mul(new TG.SinY().frequency(0.08))
        .div(new TG.Number().tint(1, 2, 1))
        .add(new TG.SinX().frequency(0.003).tint(0.5, 0, 0))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.066))
        .add(new TG.SinY().frequency(0.066))
        .mul(new TG.SinX().offset(32).frequency(0.044).tint(2, 2, 2))
        .mul(new TG.SinY().offset(16).frequency(0.044).tint(2, 2, 2))
        .sub(new TG.Number().tint(0.5, 2, 4))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.004))
        .mul(new TG.SinY().frequency(0.004))
        .mul(new TG.SinY().offset(32).frequency(0.02))
        .div(new TG.SinX().frequency(0.02).tint(8, 5, 4))
        .add(new TG.Noise().tint(0.1, 0, 0))
        .add(new TG.Noise().tint(0, 0.1, 0))
        .add(new TG.Noise().tint(0, 0, 0.1))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard())
        .add(new TG.CheckerBoard().size(2, 2).tint(0.5, 0, 0))
        .add(new TG.CheckerBoard().size(8, 8).tint(1, 0.5, 0.5))
        .sub(new TG.CheckerBoard().offset(16, 16).tint(0.5, 0.5, 0))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.Rect().position(size / 4.8, size / 12).size(size / 1.7, size / 2).tint(1, 0.25, 0.25))
        .add(new TG.Rect().position(size / 12, size / 4).size(size / 1.21, size / 2).tint(0.25, 1, 0.25))
        .add(new TG.Rect().position(size / 4.8, size / 2.5).size(size / 1.7, size / 2).tint(0.25, 0.25, 1))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard().size(32, 32).tint(0.5, 0, 0))
        .set(new TG.SineDistort())
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard().size(32, 32).tint(0.5, 0, 0))
        .set(new TG.Twirl().radius(size / 2).position(size / 2, size / 2).strength(75))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.Circle().position(size / 2, size / 2).radius(size / 4))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.Circle().position(size / 2, size / 2).radius(size / 4).delta(size / 4).tint(1, 0.25, 0.25))
        .set(new TG.Pixelate().size(size / 32, size / 32))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard().tint(1, 1, 0))
        .set(new TG.Transform().offset(10, 20).angle(23).scale(2, 0.5))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard())
        .and(new TG.Circle().position(size / 2, size / 2).radius(size / 3))
        .xor(new TG.Circle().position(size / 2, size / 2).radius(size / 4))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.CheckerBoard().size(size / 16, size / 16))
        .set(new TG.Twirl().radius(size / 2).strength(75).position(size / 2, size / 2))
        .min(new TG.Circle().position(size / 2, size / 2).radius(size / 2).delta(size / 2))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.LinearGradient().interpolation(0)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.LinearGradient().interpolation(1)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.LinearGradient().interpolation(2)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.RadialGradient().center(size / 2, size / 2).radius(size / 8).repeat(true).interpolation(0)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.RadialGradient().center(0, 0).radius(size * 2).interpolation(1)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    var texture = new TG.Texture(size, size)
        .add(new TG.RadialGradient().center(size / 2, 0).radius(size).interpolation(2)
            .point(0, [1, 1, 0, 0])
            .point(0.25, [0.2, 0, 0.5, 1])
            .point(0.5, [0.5, 0.2, 0.5, 1])
            .point(1, [1, 0, 1, 1]))
        .toCanvas();
    return texture;
});
examples.push(function(size) {
    vignette = new TG.Texture(size, size)
        .set(new TG.Circle().radius(size).position(size / 2, size / 2).delta(size * 0.7));
    var numSamples = 6;
    var base = new TG.Texture(size, size)
        .set(new TG.FractalNoise().amplitude(0.46).persistence(0.78).interpolation(0))
        .set(new TG.Normalize());
    var blur = new TG.Texture(size, size);
    for (i = 0; i <= numSamples; i++) {
        var sample = new TG.Texture(size, size)
            .set(new TG.PutTexture(base))
            .set(new TG.Transform().scale(1 + 0.01 * i, 1 + 0.01 * i).angle(0.5 * i));
        blur.add(new TG.PutTexture(sample));
    }
    blur.set(new TG.Normalize())
        .mul(new TG.PutTexture(vignette));
    base.toCanvas();
    var texture = blur.toCanvas();
    return texture;
});
examples.push(function(size) {
    var subDim = Math.floor(size / 4);
    var pixel = new TG.Texture(subDim, subDim)
        .set(new TG.FractalNoise().baseFrequency(subDim / 15).octaves(1).amplitude(1))
        .set(new TG.GradientMap().interpolation(0)
            .point(0, [250, 230, 210])
            .point(0.2, [255, 92, 103])
            .point(0.4, [200, 15, 17])
            .point(0.6, [140, 49, 59])
            .point(0.8, [35, 10, 12])
            .point(1, [0, 0, 0]))
        .div(new TG.Number().tint(255, 255, 255));
    var mirrored = new TG.Texture(size, size)
        .add(new TG.PutTexture(pixel).repeat(2))
        .mul(new TG.PutTexture(vignette).tint(1.2, 1.2, 1.2));
    var texture = mirrored.toCanvas();
    return texture;
});

function generateTexture(a) {
    if (a >= examples.length) return;
    var div = document.createElement("div");
    var source = document.createElement("pre");
    source.innerHTML = examples[a].toString()
        .replace(/([\n\t]+return[\s\S]+)|(^\t{4})/gm, "")
        .replace(/^[\s\S]+?\n/, "")
        .replace(/\t/g, "    ");
    div.appendChild(examples[a](s));
    div.appendChild(source);
    generated.appendChild(div);
    generated.appendChild(document.createElement("br"));
    setTimeout(function() { generateTexture(a + 1); })
};
var s = (window.location.hash) ? parseInt(window.location.hash.substring(1), 10) : 256;
setTimeout(function() { generateTexture(0); });
window.addEventListener("hashchange", function() {
    window.location.reload();
});
document.getElementById("customSize").addEventListener("click", function() {
    newSize = prompt("Size in pixel:", 256);
    if (newSize) window.location.hash = newSize;
});
