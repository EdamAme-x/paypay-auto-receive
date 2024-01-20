let url = "";

async function submit() {
    console.log(url);
    const resp = await fetch("http://localhost:8000/receive", {
        method: "POST",
        body: JSON.stringify({
            url: url
        })
    })

    const data = await resp.text();

    render("app", () => {
        return `
        <h2>${data}</h2>
        `
    });
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