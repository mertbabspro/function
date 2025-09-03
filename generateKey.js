import fetch from "node-fetch";
import crypto from "crypto";

export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { deviceHash } = body;

        if (!deviceHash) {
            return { statusCode: 400, body: JSON.stringify({ message: "Hash gönderilmedi" }) };
        }

        // Rastgele key üret
        const key = crypto.randomBytes(8).toString("hex");

        // JustPaste.it'e POST (HTML form submission)
        const form = new URLSearchParams();
        form.append("text", key);
        form.append("title", `Key for device ${deviceHash}`);

        const res = await fetch("https://justpaste.it/", {
            method: "POST",
            body: form,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            redirect: "manual" // redirect ile oluşturulan link alınacak
        });

        // JustPaste.it redirect header'ında yeni paste linki bulunur
        const pasteLink = res.headers.get("location") 
            ? "https://justpaste.it" + res.headers.get("location") 
            : "Link alınamadı";

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Key oluşturuldu. Linke yönlendiriliyorsunuz...",
                pasteLink: pasteLink
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Sunucu hatası", error: err.message })
        };
    }
}
