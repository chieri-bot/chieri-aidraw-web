
var api_endpoint = "https://www.chinosk6.cn/backend"

function reset_password() {
    let qq = document.getElementById("qq").value;
    let check_code = document.getElementById("check_code").value;
    let passwd = document.getElementById("passwd").value;
    let recheck_passwd = document.getElementById("recheck_passwd").value;
    if (passwd !== recheck_passwd) {
        alert("两次输入的密码不一致")
        return;
    }
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let raw = JSON.stringify({
        "qq": qq,
        "check_code": check_code,
        "new_passwd": passwd
    });
    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(api_endpoint + "/ai/draw/change_password", requestOptions)
        .then(response => response.json().then(parsedJson => {
            let success = parsedJson["success"];
            if (success) {
                alert("修改成功。");
                document.cookie = "token_expiration=0";
                window.location.href="index.html"
            }
            else {
                alert("修改失败，请检查您输入的信息是否正确。");
            }
        }))
        .catch(error => console.log('error', error));
}
