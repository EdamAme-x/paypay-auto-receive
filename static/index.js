let url = "";

function submit() {
    console.log(url);
}

function Index() {
    return `
    <input type="text" value="${url}" placeholder="https://pay.paypay.ne.jp/..." oninput="url = this.value" />
    <button id="button" onclick="submit()">送信</button>
    `;
}

function render(id, func) {
    document.getElementById(id).innerHTML = func();
}

render("app", Index);