let idx = 0;
let submission;
let image_csv;
let previous_config;
let scaling_factor = 1;
let fps = 60;
let ppf = 10;
let cost = 0;
let previous_r;
let previous_g;
let previous_b;
let speed = 10;
let previous_pixels;
let arm_colors;
let paused;
let image_canvas;

function preload() {
    loadTable('image.csv', 'csv', 'header', (table) => {
        image_csv = table;
    });
    load_submission('submission82425.csv');
}

function load_submission(submission_file) {
    loadTable(submission_file, 'csv', 'header', (table) => {
        submission = [];
        for (let idx = 0; idx < table.rows.length; idx++)
        {
            submission.push(table.rows[idx].arr[0].split(";"));
        }
        reset();
    });
}

function setup() {
    var plot = createCanvas(257 * scaling_factor, 257 * scaling_factor);
    image_canvas = createGraphics(257 * scaling_factor, 257 * scaling_factor);

    plot.parent("canvas");
    image_canvas.parent("canvas");

    background(220);
    strokeWeight(2);

    arm_colors = [
        color('#c62500'),
        color('#49E020'),
        color('#3836E0'),
        color('#E05409'),
        color('#D52DE0'),
        color('#068694'),
        color('#E0AD09'),
        color('#000000')
    ];

}

function pause() {
    paused = !paused;
    if (paused) {
        document.getElementById("pause_btn").value = "Unpause";
        document.getElementById("decrease_pixel").disabled = false;
        document.getElementById("increase_pixel").disabled = false;
    } else {
        document.getElementById("pause_btn").value = "Pause";
        document.getElementById("decrease_pixel").disabled = true;
        document.getElementById("increase_pixel").disabled = true;
    }
}

function config_to_cartesian(config) {
    let x = 128;
    let y = 128;
    for (let j = 0; j < config.length; j++) {
        [config_x, config_y] = config[j].split(" ");
        x += int(config_x);
        y -= int(config_y);
    }
    return [x, y]
}


function get_image_rgb(x, y) {
    [_, _, r, g, b] = image_csv.rows[257 * y + x].arr;
    return [r, g, b]
}

function calculate_cost(config1, config2) {
    if (!config1)
        return [0, 0];

    let arm_cost = 0;
    let color_cost = 0;

    for (let j = 0; j < config2.length; j++) {
        if (config1[j] != config2[j])
            arm_cost++;
    }

    [previous_x, previous_y] = config_to_cartesian(config1);
    [x, y] = config_to_cartesian(config2);

    [r, g, b] = get_image_rgb(previous_x, previous_y);
    [previous_r, previous_g, previous_b] = get_image_rgb(x, y);

    color_cost += 3 * Math.abs(r - previous_r);
    color_cost += 3 * Math.abs(g - previous_g);
    color_cost += 3 * Math.abs(b - previous_b);

    return [arm_cost, color_cost];
}

function draw_config(config) {
    let x_config;
    let y_config;
    [x_config, y_config] = config_to_cartesian(config);

    [_, _, r, g, b] = image_csv.rows[257 * y_config + x_config].arr;
    scaled_plot(x_config, y_config, r * 255, g * 255, b * 255);
}

function undraw_config(config) {
    let x_config;
    let y_config;
    [x_config, y_config] = config_to_cartesian(config);

    scaled_plot(x_config, y_config);
}

function scaled_plot(x, y, r=222, g=222, b=222) {
    let c = color(r, g, b);
    image_canvas.stroke(c);
    for (let scaled_x = scaling_factor * x; scaled_x < scaling_factor * x + scaling_factor; scaled_x++) {
        for (let scaled_y = scaling_factor * y; scaled_y < scaling_factor * y + scaling_factor; scaled_y++) {
            image_canvas.point(scaled_x, scaled_y);
        }
    }
}

function draw_arm(config) {
    let x = 128;
    let y = 128;
    let arm_pts = [[x,y]]
    for (let j = 0; j < config.length; j++) {
        [config_x, config_y] = config[j].split(" ");
        x += int(config_x);
        y -= int(config_y);
        arm_pts.push([x,y]);
    }

    scale(scaling_factor);
    strokeWeight(1/scaling_factor);
    for (let j = 1; j < arm_pts.length; j++) {
        stroke(arm_colors[j - 1]);
        line(arm_pts[j - 1][0], arm_pts[j - 1][1], arm_pts[j][0], arm_pts[j][1]);
    }
}

function draw() {
    background(220);
//    let x = round(mouseX / scaling_factor);
    let x = Math.ceil(mouseX / scaling_factor);
//    let y = round(mouseY / scaling_factor);
    let y = Math.ceil(mouseY / scaling_factor);
    if (x >= 0 &&  x <= 257 && y >= 0 && y <= 257) {
        document.getElementById("pixel_position").textContent = "(" + mouseX / scaling_factor + ", " + y + ")";
        let pixel_str = "(" + x + ", " + y + ")";
        let text_x = min(mouseX + 10, 257 * scaling_factor - textWidth(pixel_str));
        let text_y = max(mouseY - 10, 12);
        text(pixel_str, text_x, text_y);
        console.log(pixel_str, text_x, text_y);
    }
    if (!submission || paused || idx >= submission.length) {
        image(image_canvas, 0, 0);
        return;
    }

    let last_idx = min(idx+speed-1, submission.length-1);
    for (let j = idx; j <= last_idx; j++) {
        draw_config(submission[j]);
    }
    image(image_canvas, 0, 0);

    post_pixel_drawing(last_idx);

    update_cost();

    idx += speed;
}

function update_cost() {
//    [arm_cost, color_cost] = calculate_cost(submission[idx-1], submission[idx]);
//    cost += arm_cost + color_cost;
//
//    document.getElementById("cost").textContent = Math.round(cost * 100) / 100;
//    document.getElementById("arm_cost").textContent = arm_cost;
//    document.getElementById("color_cost").textContent = Math.round(color_cost * 100) / 100;
//    document.getElementById("pixel").textContent = idx + 1;
}

function rescale() {
    scaling_factor = int(document.getElementById("scaling_factor").value);
    document.getElementById("current_scale").textContent = scaling_factor;
    resizeCanvas(257 * scaling_factor, 257 * scaling_factor);
    image_canvas.resizeCanvas(257 * scaling_factor, 257 * scaling_factor);
    reset();
}

function increase_scale() {
    scaling_factor += 1;
    document.getElementById("scaling_factor").value = scaling_factor;
    document.getElementById("current_scale").textContent = scaling_factor;
    rescale();
}

function decrease_scale() {
    if (scaling_factor == 1) {
        return;
    }
    scaling_factor -= 1;
    document.getElementById("scaling_factor").value = scaling_factor;
    document.getElementById("current_scale").textContent = scaling_factor;
    rescale();
}

function decrease_pixel() {
    console.log(idx);
    first_idx = max(0, idx-speed);
    for (let j = idx-1; j >= first_idx; j--) {
        undraw_config(submission[j]);
    }
    idx = first_idx;
    post_pixel_drawing(first_idx);
}

function increase_pixel() {
    console.log(idx);
    last_idx = min(submission.length-1, idx+speed-1);
    for (let j = idx; j <= last_idx; j++) {
        draw_config(submission[j]);
    }
    idx = last_idx+1;

    post_pixel_drawing(last_idx);
}

function post_pixel_drawing(pixel_idx) {
    document.getElementById("current_pixel").textContent = pixel_idx;
    document.getElementById("current_pixel").textContent = pixel_idx;
    document.getElementById("pixel").value = pixel_idx;

//    updatePixels();
//    previous_pixels = pixels;
    draw_arm(submission[pixel_idx]);
}

function update_fps() {
    fps = int(document.getElementById("fps").value);
    document.getElementById("current_fps").textContent = fps;
    frameRate(fps);
}

function increase_fps() {
    fps += 1;
    document.getElementById("fps").value = fps;
    update_fps();
}

function decrease_fps() {
    if (fps == 1) {
        return;
    }
    fps -= 1;
    document.getElementById("fps").value = fps;
    update_fps();
}

function update_speed() {
    speed = int(document.getElementById("speed").value);
    document.getElementById("current_speed").textContent = speed;
    document.getElementById("decrease_pixel").value = "-" + speed;
    document.getElementById("increase_pixel").value = "+" + speed;
}

function increase_speed() {
    speed += 1;
    document.getElementById("speed").value = speed;
    update_speed();
}

function decrease_speed() {
    if (speed == 1) {
        return;
    }
    speed -= 1;
    document.getElementById("speed").value = speed;
    update_speed();
}

function reset() {
    if (idx == 0) {
        return;
    }
    idx = 0;
    background(220);
}

let fileInput = document.getElementById("csv");

fileInput.addEventListener('change', () => {
    const objectURL = window.URL.createObjectURL(fileInput.files[0]);
    load_submission(objectURL);
});

document.getElementById("scaling_factor").value = scaling_factor;
document.getElementById("current_scale").textContent = scaling_factor;

document.getElementById("fps").value = fps;
document.getElementById("current_fps").textContent = fps;

document.getElementById("speed").value = speed;
document.getElementById("current_speed").textContent = speed;

document.getElementById("decrease_pixel").value = "-" + speed;
document.getElementById("increase_pixel").value = "+" + speed;

