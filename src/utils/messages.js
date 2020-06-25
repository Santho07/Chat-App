const generateMessage = (text, sender) => {
    return {
        sender,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (url, sender) => {
    return {
        sender,
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}