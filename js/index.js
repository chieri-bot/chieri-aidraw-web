
var tlb = null;

function add_text_child(text) {
    if (tlb != null) {
        tlb.remove()
    }
    let label_input = document.getElementById("label_input")
    tlb = label_input.appendChild(document.createTextNode(text));
}

function login() {
    document.getElementById("label_recheck_passwd").style.display = "none";
    let qq = document.getElementById("qq").value;
    let passwd = document.getElementById("passwd").value;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if (qq === "" || passwd === "") {
        alert("请输入数据");
        return false;
    }

    const raw = JSON.stringify({
        "qq": qq,
        "passwd": passwd
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(api_endpoint + "/ai/draw/login", requestOptions)
        .then(response => {
            response.json().then(parsedJson => {
                let success = parsedJson["success"];
                let msg = parsedJson["msg"];

                if (success) {
                    let token = parsedJson["token"];
                    let expiration = parsedJson["expiration"];
                    add_text_child("登录成功, 正在跳转...");
                    document.cookie = `token=${token}`;
                    document.cookie = `token_expiration=${expiration}`;
                    window.location.href="generate_image.html";
                }
                else {
                    add_text_child("登录失败: " + msg);
                }
            });
        })
        .catch(error => console.log('error', error));
}

function register() {
    let recheck_passwd = document.getElementById("label_recheck_passwd");
    if (recheck_passwd.style.display === "none") {
        recheck_passwd.style.display = "flex";
        return false;
    }
    let qq = document.getElementById("qq").value;
    let passwd = document.getElementById("passwd").value;
    let passwd_check = document.getElementById("recheck_passwd").value;
    if (passwd !== passwd_check) {
        alert("两次密码输入不一致");
        return false;
    }
    if (qq === "" || passwd === "") {
        alert("请输入数据");
        return false;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({
        "qq": qq,
        "passwd": passwd
    });
    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    fetch(api_endpoint + "/ai/draw/register", requestOptions)
        .then(response => {
            response.json().then(parsedJson => {
                let success = parsedJson["success"];
                let msg = parsedJson["msg"];

                if (success) {
                    add_text_child("注册成功: " + msg);
                }
                else {
                    add_text_child("注册失败: " + msg);
                }
                recheck_passwd.style.display = "none";
            });
        })
        .catch(error => console.log('error', error));
    return false
}

function login_load_cookie() {
    let cookies = document.cookie;
    let cookie_lst = cookies.split(";");
    let expiration_time = 0;
    for (const i in cookie_lst) {
        const values = cookie_lst[i].split("=");
        const k = values[0].trim();
        const v = values[1].trim();
        if (k === "token_expiration") {
            expiration_time = parseInt(v);
        }
    }
    let now_time = Math.round(new Date() / 1000);
    if (expiration_time > now_time + 10800) {
        window.location.href="generate_image.html"
    }
}
