const https = require('https')
const querystring = require('querystring')
const dgram = require('dgram')

const log = require('./')(__filename, true)

module.exports =  { slack, logstash }

function slack ({ token, channel, icon }) {
	if (!token) {
		throw new Error('Token is required.')
	}

	if (!channel) {
		throw new Error('Channel is required.')
	}

	return function (ev) {
		const payload = querystring.stringify({
			token: token,
			channel: channel,
			icon_emoji: icon,
			mrkdwn: true,
			text: `*${ev.time}* ${'`'}${ev.category}${'`'} ${'```\n'}${ev.message}${'\n```'}`,
		})

		const request = https.request({
			hostname: 'slack.com',
			path: '/api/chat.postMessage',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(payload),
			},
		}, handleResponse)

		request.on('error', handlError)
		request.write(payload)
		request.end()

		function handleResponse (response) {
			if (response.statusCode != 200) {
				handlError(new Error(String(response.statusCode)))
			}
			response.on('error', handlError)
		}

		function handlError (error) {
			log.error(`failed to send message to slack due to ${error.stack}`)
		}
	}
}

function logstash ({ url }) {
	if (!url) {
		throw new Error('URL is required.')
	}

	const [host, port] = url.split(':')

	if (!port) {
		throw new Error('Port is required.')
	}

	let udpSocket

	return function (ev) {
		if (!udpSocket) {
			udpSocket = dgram.createSocket('udp4')
			udpSocket.on('error', error => {
				log.error(`udp socket error ${error.stack}`)
				udpSocket.close()
				udpSocket = null
			})
		}

		const buffer = new Buffer(JSON.stringify(ev))
		udpSocket.send(buffer, 0, buffer.length, port, host, error => {
			if (!error) {
				return
			}
			log.error(`failed to send message to logstash due to ${error.stack}`)
		})
	}
}