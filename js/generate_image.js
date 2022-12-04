

var adv_settings_is_show = false;
var chieri_token = "";
var chieri_expiration_time = 0;
// var chieri_user_qq = "";

var tlb_gene_im = null;
let imghist_is_close = true;

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

function gene_on_load() {
    change_size()
    load_cookie()
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
    document.getElementById("gene_loading").style.display = "inline-table";
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
                let imgurl = URL.createObjectURL(base64toBlob(`data:image/png;base64,${img_b64}`));
                document.getElementById("aiimg").src = imgurl;
                add_generate_history_lst(imgurl)
            }
            else {
                add_text_child_gene(`生成失败: ${msg}`);
                if (response.status === 401) {
                    document.cookie = "token_expiration=0";
                    add_text_child_gene(`您的登录已过期, 请刷新页面重新登录。`);
                }
            }
        }))
        .catch(error => {
            console.log('error', error);
            add_text_child_gene(`生成失败: ${error}`);
        })
        .finally(() => {
            update_left_point();
            document.getElementById("gene_loading").style.display = "none";
            document.getElementById("btn_start_generate_image").disabled = false;
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

function getViewPortHeight() {
    return document.documentElement.clientHeight || document.body.clientHeight;
}

function change_size() {
    let div_input = document.getElementById("div_input");
    let div_img = document.getElementById("div_img");
    let aiimg = document.getElementById("aiimg");
    let div_gene_hist = document.getElementById("div_gene_hist");
    // console.log(document.body.clientWidth);
    if (document.body.clientWidth >= 888 && document.documentElement.clientWidth > document.documentElement.clientHeight) {
        div_input.style.display = "inline-table";
        div_img.style.display = "inline-table";
        div_img.style.width = `${document.body.clientWidth - 600}px`;
        div_img.style.height = `${div_input.offsetHeight - 30}px`;
        div_gene_hist.style.height = `${getViewPortHeight() * 0.65}px`;
    }
    else {
        div_input.style.display = "table";
        div_img.style.display = "table";
        div_img.style.width = `${div_input.offsetWidth - 10}px`;
        div_img.style.height = "auto";
        div_gene_hist.style.height = `${getViewPortHeight() * 0.55}px`;
    }
    aiimg.style.maxWidth = `${div_img.offsetWidth - 30}px`;
    aiimg.style.width = "auto";
    aiimg.style.height = "auto";
    div_gene_hist.style.width = `${document.body.clientWidth * 0.75}px`;
}

function show_generate_history_lst() {
    document.getElementById("div_hist").style.display = "block";
}

function hide_generate_history_lst() {
    document.getElementById("div_hist").style.display = "none";
}

function add_generate_history_lst(image) {
    let newediv = document.createElement("div");
    newediv.className = "imghist_div";
    newediv.onclick = function () {
        gene_img_lst_onclick(this);
    };
    let delBtn = document.createElement("a");
    delBtn.innerHTML = "×"
    delBtn.href = "javascript:void(0);";
    delBtn.className = "imghist_close";
    delBtn.onclick = function () {
        remove_gene_img(newediv);
    }
    newediv.appendChild(delBtn)
    newediv.style.backgroundImage = `url(${image})`
    // let newimg = document.createElement("img");
    // newimg.src = image;
    // newimg.className = "imghist_img";
    // newediv.appendChild(newimg);
    let lst = document.getElementById("div_gene_hist");
    lst.appendChild(newediv);
}

function gene_img_lst_onclick(im_div) {
    let back_img = im_div.style.backgroundImage;
    document.getElementById("aiimg").src = back_img.substring(5, back_img.length - 2);
    if (imghist_is_close) {
        hide_generate_history_lst();
    }
    else {
        imghist_is_close = true;
    }
    // let rs = im_div.getElementsByTagName("img");
    // if (rs.length > 0) {
    //     document.getElementById("aiimg").src = rs[0].src;
    //     hide_generate_history_lst();
    // }
}

function remove_gene_img(im_div) {
    imghist_is_close = false;
    if (confirm("是否清除此图片？")) {
        im_div.remove();
    }
}

function image_url_to_b64(url, num, callback){
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    let img = new Image
    img.crossOrigin = 'Anonymous'
    img.onload = function(){
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img,0,0)
        let URLData = canvas.toDataURL('image/png')
        callback(url, URLData, num);
        canvas = null
    }
    img.src = url
}

function downloadAllImg() {
    let zip = new JSZip();
    let div_gene_hist = document.getElementById("div_gene_hist");
    let div_imgs = div_gene_hist.getElementsByTagName("div");
    let finished_count = 0;
    let save_loading = document.getElementById("save_loading");
    let save_btn = document.getElementById("save_btn");

    function on_image_loaded(url, b64data, num) {
        zip.file(`${num}.png`, b64data.substring("data:image/png;base64,".length), {base64: true});
        finished_count++;
        // URL.revokeObjectURL(url);
        if (finished_count >= div_imgs.length) {
            save_loading.style.display = "none";
            save_btn.disabled = false;
            zip.generateAsync({type:"blob"}).then(function(content) {
                saveAs(content, "chieri_ai_image.zip");
            });
            if (document.getElementById("saveanddelete").checked) {
                div_gene_hist.innerHTML = "";
            }
        }
    }

    if (div_imgs.length > 0) {
        save_loading.style.display = "inline-table";
        save_btn.disabled = true;
        for (let n = 0; n < div_imgs.length; n++) {
            const img_url = div_imgs[n].style.backgroundImage.substring(5, div_imgs[n].style.backgroundImage.length - 2);
            image_url_to_b64(img_url, n, on_image_loaded);
        }
    }
    else {
        alert("没有需要保存的图片");
    }
}
