
var api_endpoint = "https://www.chinosk6.cn/backend"
var adv_settings_is_show = false;
var chieri_token = "";
var chieri_expiration_time = 0;
// var chieri_user_qq = "";

var tlb_gene_im = null;

function add_text_child_gene(text) {
    if (tlb_gene_im != null) {
        tlb_gene_im.remove()
    }
    let label_input = document.getElementById("gene_space")
    tlb_gene_im = label_input.appendChild(document.createTextNode(text));
}

function change_seed_box_state() {
    document.getElementById("seed").disabled = document.getElementById("seed_random").checked;
}

function show_adv_settings() {
    if (adv_settings_is_show) {
        hide_adv_settings();
        return;
    }
    document.getElementById("adv_settings").style.display = "block";
    adv_settings_is_show = true;
}

function hide_adv_settings() {
    document.getElementById("adv_settings").style.display = "none";
    adv_settings_is_show = false;
}

function load_cookie() {
    document.getElementById("seed_random").click();
    let cookies = document.cookie;
    let cookie_lst = cookies.split(";");
    for (const i in cookie_lst) {
        const values = cookie_lst[i].split("=");
        const k = values[0].trim();
        const v = values[1].trim();
        if (k === "token") {
            chieri_token = v;
        }
        else if (k === "token_expiration") {
            chieri_expiration_time = parseInt(v);
        }
        else if (k === "cache_tags") {
            document.getElementById("tags").value = v;
        }
    }
    let now_time = Math.round(new Date() / 1000);
    if (chieri_expiration_time <= now_time) {
        window.location.href="index.html";
        return;
    }
    update_left_point();
}

function update_left_point() {
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `chieribot ${chieri_token}`);
    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(api_endpoint + "/ai/draw/get_left_point", requestOptions)
        .then(response => response.json().then(parsedJson => {
            let is_success = parsedJson["success"];
            let msg = parsedJson["msg"];
            if (is_success) {
                let left_point = parseFloat(parsedJson["left_point"]);
                // chieri_user_qq = parsedJson["qq"];
                document.getElementById("left_point").innerHTML = String(left_point);
                if (left_point < 2) {
                    document.getElementById("upload_img").disabled = true;
                    document.getElementById("btn_start_generate_image").disabled = false;
                    clear_uploadimg_select();
                }
                else if (left_point < 1) {
                    document.getElementById("upload_img").disabled = true;
                    document.getElementById("btn_start_generate_image").disabled = true;
                }
                else {
                    document.getElementById("upload_img").disabled = false;
                    document.getElementById("btn_start_generate_image").disabled = false;
                }
            }
            else {
                add_text_child_gene(`点数获取失败: ${msg}`);
                if (response.status === 401) {
                    document.cookie = "token_expiration=0";
                    add_text_child_gene(`您的登录已过期, 请刷新页面重新登录。`);
                }
            }

        }))
        .catch(error => console.log('error', error));
}


function getObjectURL(file) {
    let url = null;
    if (window.createObjcectURL !== undefined) {
        url = window.createOjcectURL(file);
    } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

function clear_uploadimg_select() {
    document.getElementById("upload_img").value = "";
}

function get_random(min, max) {
    return Math.random()*(min - max) + max;
}

function base64toBlob(dataurl) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function start_generate_image() {
    document.getElementById("btn_start_generate_image").disabled = true;
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `chieribot ${chieri_token}`);

    let formdata = new FormData();
    let input_tags = document.getElementById("tags").value;
    let seed;
    if (document.getElementById("seed_random").checked) {
        seed = parseInt(get_random(0, 2**32 - 1));
        document.getElementById("seed").value = seed;
    }
    else {
        seed = document.getElementById("seed").value;
    }

    formdata.append("model", document.getElementById("model").value);
    formdata.append("sampler", document.getElementById("sampler").value);
    formdata.append("strength", document.getElementById("strength").value);
    formdata.append("noise", document.getElementById("noise").value);
    formdata.append("ucPreset", document.getElementById("ucPreset").value);
    formdata.append("uc", document.getElementById("uc").value);
    formdata.append("input", input_tags);
    formdata.append("seed", seed);
    formdata.append("ratio", document.getElementById("ratio").value);
    formdata.append("scale", document.getElementById("scale").value);
    document.cookie = `cache_tags=${input_tags}`;

    if (document.getElementById("upload_img").value !== "") {
        formdata.append("image", document.getElementById("upload_img").files[0], "image");
    }

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    fetch(api_endpoint + "/ai/draw/generate", requestOptions)
        .then(response => response.json().then(parsedJson => {
            let is_success = parsedJson["success"];
            let msg = parsedJson["msg"];
            if (is_success) {
                let img_b64 = parsedJson["image"];
                // document.getElementById("aiimg").src = `data:image/png;base64,${img_b64}`;
                document.getElementById("aiimg").src = URL.createObjectURL(base64toBlob(`data:image/png;base64,${img_b64}`));
            }
            else {
                add_text_child_gene(`生成失败: ${msg}`);
                if (response.status === 401) {
                    document.cookie = "token_expiration=0";
                    add_text_child_gene(`您的登录已过期, 请刷新页面重新登录。`);
                }
            }
            update_left_point();
            document.getElementById("btn_start_generate_image").disabled = false;
        }))
        .catch(error => {
            console.log('error', error);
            document.getElementById("btn_start_generate_image").disabled = false;
            update_left_point();
            add_text_child_gene(`生成失败: ${error}`);
        });
}

function logout() {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let raw = JSON.stringify({
        "token": chieri_token
    });
    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(api_endpoint + "/ai/draw/logout", requestOptions)
        .then(response => response.json().then(parsedJson => {
            let is_success = parsedJson["success"];
            if (is_success) {
                document.cookie = "token_expiration=0";
                window.location.href="index.html"
            }
            else {
                alert("操作失败。")
            }
        }))
        .catch(error => console.log('error', error));
}
