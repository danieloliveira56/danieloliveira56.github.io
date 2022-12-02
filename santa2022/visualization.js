let idx = 0;
let submission;
let config;
let previous_config;
let scale = 2;
let fps = 60;
let ppf = 4;
let cost = 0;
let r;
let g;
let b;
let previous_r;
let previous_g;
let previous_b;

function scaled_plot(x, y, r, g, b) {
    let c = color(r, g, b);
    for (let scaled_x = scale * x; scaled_x < scale * x + scale; scaled_x++) {
        for (let scaled_y = scale * y; scaled_y < scale * y + scale; scaled_y++) {
            set(scaled_x, scaled_y, c);
        }
    }
    previous_pixels = pixels;
}

function preload() {
    loadTable('image.csv', 'csv', 'header', (table) => {
        image = table;
    });
    loadTable('submission82425.csv', 'csv', 'header', (table) => {
        submission = table;
    });
}

let previous_pixels;

function setup() {
    createCanvas(257 * scale, 257 * scale);
    background(220);
    strokeWeight(2);
}

let config_x;
let config_y;

function draw() {
    let arm_colors = [
        color('#c62500'),
        color('#49E020'),
        color('#3836E0'),
        color('#E05409'),
        color('#D52DE0'),
        color('#068694'),
        color('#E0AD09'),
        color('#000000')
    ];

    if (!submission) {
        return;
    }
    pixels = previous_pixels;
    updatePixels();

    let x = 128;
    let y = 128;
    arm_pts = [[scale * x, scale * y]];
    previous_config = config;
    config = submission.rows[idx].arr[0].split(";");
    for (let j = 0; j < config.length; j++) {
        [config_x, config_y] = config[j].split(" ");
        x += int(config_x);
        y -= int(config_y);
        arm_pts.push([scale * x, scale * y]);
    }


    [previous_r, previous_g, previous_b] = [r, g, b];
    [_, _, r, g, b] = image.rows[257 * y + x].arr;
    scaled_plot(x, y, r * 255, g * 255, b * 255);
    updatePixels();
    loadPixels();
    previous_pixels = pixels;

    for (let j = 1; j < arm_pts.length; j++) {
        stroke(arm_colors[j - 1]);
        line(arm_pts[j - 1][0], arm_pts[j - 1][1], arm_pts[j][0], arm_pts[j][1]);
    }

    let arm_cost = 0;
    let color_cost = 0;
    if (idx > 0) {
        for (let j = 0; j < config.length; j++) {
            if (previous_config[j] != config[j])
                arm_cost++;
        }
        color_cost += 3 * Math.abs(r - previous_r);
        color_cost += 3 * Math.abs(g - previous_g);
        color_cost += 3 * Math.abs(b - previous_b);
    }
    cost += arm_cost;
    cost += color_cost;

    document.getElementById("cost").textContent = Math.round(cost * 100) / 100;
    document.getElementById("arm_cost").textContent = arm_cost;
    document.getElementById("color_cost").textContent = Math.round(color_cost * 100) / 100;
    document.getElementById("pixel").textContent = idx + 1;
    idx++;
    if (idx >= submission.rows.length) {
        reset();
    }
}

let fileInput = document.getElementById("csv");

fileInput.addEventListener('change', () => {
    const objectURL = window.URL.createObjectURL(fileInput.files[0]);
    loadTable(objectURL, 'csv', 'header', (table) => {
        submission = table;
        reset();
    });
});

function rescale() {
    scale = int(document.getElementById("scale").value);
    document.getElementById("current_scale").textContent = scale;
    resizeCanvas(257 * scale, 257 * scale);
    reset();
}

function update_framerate() {
    fps = int(document.getElementById("framerate").value);
    document.getElementById("current_framerate").textContent = fps;
    frameRate(fps);
}

function reset() {
    idx = 0;
    background(220);
    loadPixels();
    previous_pixels = pixels;
}

document.getElementById("scale").value = scale;
document.getElementById("current_scale").textContent = scale;


