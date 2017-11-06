TG.Texture.prototype.addToPage = function(desc) {
    var div = document.createElement("div");
    var p = document.createElement("p");
    p.innerHTML = desc;
    div.appendChild(this.toCanvas());
    div.appendChild(p);
    noise.appendChild(div);
    return div;
}

function render() {
    var noise = document.getElementById("noise");
    var pageStatus = document.getElementById("render");
    var hint = document.getElementById("hint");
    var seed = Date.now();
    new TG.Texture(200, 200)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(20).octaves(1).amplitude(0.5))
        .addToPage("Base Frequency");
    new TG.Texture(200, 200)
        .set(new TG.FractalNoise().seed(seed * 2).baseFrequency(10).octaves(1).amplitude(0.25))
        .addToPage("+ Octave");
    new TG.Texture(200, 200)
        .set(new TG.FractalNoise().seed(seed * 3).baseFrequency(5).octaves(1).amplitude(0.125))
        .addToPage("+ Octave");
    var spacing = new TG.Texture(200, 200)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(20).octaves(3).step(2).amplitude(0.5).persistence(0.5))
        .addToPage("= Fractal Noise");
    spacing.style.margin = "20px 20px 80px";
    line = document.createElement("br");
    noise.appendChild(line);
    var amp = [0.32, 0.42, 0.32, 0.42];
    var prs = [0.78, 0.78, 0.68, 0.68];
    for (var i = 0; i < 4; i++) {
        new TG.Texture(200, 200)
            .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2).amplitude(amp[i]).persistence(prs[i]))
            .addToPage("No Interpolation<br/>Amplitude: " + amp[i] + "<br/>Persistence: " + prs[i]);
    }
    var line = document.createElement("br");
    noise.appendChild(line);
    for (var i = 0; i < 4; i++) {
        new TG.Texture(200, 200)
            .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2).amplitude(amp[i]).persistence(prs[i]).interpolation(1))
            .addToPage("Linear Interpolation<br/>Amplitude: " + amp[i] + "<br/>Persistence: " + prs[i]);
    }
    line = document.createElement("br");
    noise.appendChild(line);
    for (var i = 0; i < 4; i++) {
        new TG.Texture(200, 200)
            .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2).amplitude(amp[i]).persistence(prs[i]).interpolation(2))
            .addToPage("Spline Interpolation<br/>Amplitude: " + amp[i] + "<br/>Persistence: " + prs[i]);
    }
    line = document.createElement("br");
    noise.appendChild(line);
    new TG.Texture(25, 25)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2))
        .addToPage("25px &#8594;");
    new TG.Texture(50, 50)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2))
        .add(new TG.Rect().size(0, 25).position(25, 0).tint(10, -10, -10))
        .add(new TG.Rect().size(25, 0).position(0, 25).tint(10, -10, -10))
        .addToPage("50px &#8594;");
    new TG.Texture(100, 100)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2))
        .add(new TG.Rect().size(0, 50).position(50, 0).tint(10, -10, -10))
        .add(new TG.Rect().size(50, 0).position(0, 50).tint(10, -10, -10))
        .addToPage("100px &#8594;");
    spacing = new TG.Texture(200, 200)
        .set(new TG.FractalNoise().seed(seed).baseFrequency(200).octaves(8).step(2))
        .add(new TG.Rect().size(0, 100).position(100, 0).tint(10, -10, -10))
        .add(new TG.Rect().size(100, 0).position(0, 100).tint(10, -10, -10))
        .addToPage("200px <br/> (width and height independent)");
    spacing.style.margin = "80px 20px 20px";
    line = document.createElement("br");
    noise.appendChild(line);
    new TG.Texture(100, 100)
        .set(new TG.Noise().seed(seed))
        .addToPage("100px &#8594;");
    spacing = new TG.Texture(200, 200)
        .set(new TG.Noise().seed(seed))
        .add(new TG.Rect().size(0, 100).position(100, 0).tint(10, -10, -10))
        .add(new TG.Rect().size(100, 0).position(0, 100).tint(10, -10, -10))
        .addToPage("200px <br/> (also works with regular noise)");
    spacing.style.margin = "20px 20px 80px";
    line = document.createElement("br");
    noise.appendChild(line);
    size = 256;
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(20).persistence(0.75).amplitude(0.4).interpolation(2).tint(0.75, 0.95, 1))
        .add(new TG.FractalNoise().baseFrequency(4).octaves(3).interpolation(1).tint(0.25, 0.35, 0.85))
        .sub(new TG.Twirl().radius(size * 3).strength(1.5).position(size / 2, size / 2))
        .mul(new TG.Circle().radius(size * 1.1).position(size / 2, size / 2).delta(size))
        .addToPage("Example 1");
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(20).persistence(0.75).amplitude(0.4).interpolation(0).tint(0.7, 0.9, 0.95))
        .add(new TG.FractalNoise().baseFrequency(4).octaves(3).interpolation(0).tint(0.2, 0.3, 0.8))
        .sub(new TG.Twirl().radius(size * 3).strength(1.5).position(size / 2, size / 2))
        .mul(new TG.Circle().radius(size * 1.1).position(size / 2, size / 2).delta(size))
        .addToPage("Example 1 (no interpolation)");
    line = document.createElement("br");
    noise.appendChild(line);
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(64).octaves(6).step(2).interpolation(2))
        .sub(new TG.Noise().tint(0, 0.1, 0))
        .min(new TG.Number().tint(0, 0.6, 0))
        .sub(new TG.Number().tint(0, 0.5, 0))
        .mul(new TG.Number().tint(0, 5, 0))
        .sub(new TG.SineDistort().sines(2, 2).amplitude(8, 8).tint(0, 0.75, 0))
        .add(new TG.Number().tint(0.06, 0, 0.085))
        .addToPage("Example 2");
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(128).octaves(6).step(2).interpolation(2))
        .sub(new TG.Noise().tint(0, 0.1, 0))
        .min(new TG.Number().tint(0, 0.63, 0))
        .sub(new TG.Number().tint(0, 0.53, 0))
        .mul(new TG.Number().tint(0, 6, 0))
        .sub(new TG.SineDistort().sines(2, 2).amplitude(4, 4).tint(0, 0.75, 0))
        .add(new TG.Number().tint(0.065, 0, 0.095))
        .addToPage("Example 2 (less distortion)");
    line = document.createElement("br");
    noise.appendChild(line);
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(64).octaves(6).step(2).interpolation(2).tint(1, 0.17, 0.32))
        .sub(new TG.Noise().tint(0.2, 0.08, 0.03))
        .mul(new TG.XOR().tint(1.5, 1.62, 1.69))
        .addToPage("Example 3 (xor)");
    new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(64).octaves(6).step(2).interpolation(2).tint(1, 0.17, 0.32))
        .sub(new TG.Noise().tint(0.2, 0.08, 0.03))
        .mul(new TG.FractalNoise().octaves(2).baseFrequency(size / 4).step(1.7).interpolation(0).amplitude(0.6).persistence(0.6).tint(1.5, 1.62, 1.69))
        .addToPage("Example 3 (noise)");
    pageStatus.innerHTML = "Seed: " + seed;
    hint.innerHTML = "(reload page for new pattern)";
};
setTimeout(render, 500);
