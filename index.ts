import $ = require('jquery');
import md5 = require('./src/md5');
import text = require('./src/text');
import rot13 = require('./src/rot13');
import base64 = require('./src/base64');
import unicode = require('./src/unicode');
import punycode = require('./src/punycode');

interface Engine {
	decode: (text:string) => Buffer,
	encode: (text:Buffer) => string,
};

const $forms:{[id:string]:JQuery} = Object.create(null);
const engines:{[id:string]:Engine} = Object.create(null);

engines['md5'] = md5;
engines['text'] = text;
engines['rot13'] = rot13;
engines['base64'] = base64;
engines['unicode'] = unicode;
engines['punycode'] = punycode;

$(document).ready(() => {
	$('.textarea').each((index, element) => {
		$forms[$(element).data('converter')] = $(element);
	});

	for (var id in $forms) {
		// Let enclose `id` into closure... since TypeScript doesn't support
		// block closure transpilings
		((id:string) => {
			const $form = $forms[id];

			$form.on('keyup keypress keydown change click contextmenu paste', (event) => {
				const text = $form.val();
				let raw:Buffer, encoded:string;

				if (!engines[id]) {
					return;
				} else {
					try {
						raw = engines[id].decode(text);
					} catch (error) {
						$form.siblings('.error').text('Decode Error: ' + error.message);
						return;
					}

					$form.siblings('.error').empty();
				}

				for (let targetId in $forms) {
					if (targetId !== id && engines[targetId]) {
						try {
							encoded = engines[targetId].encode(raw);
						} catch (error) {
							$forms[targetId].siblings('.error').text('Encode Error: ' + error.message);
							return;
						}

						$forms[targetId].siblings('.error').empty();
						$forms[targetId].val(encoded);
					}
				}
			});
		})(id);
	}
});
