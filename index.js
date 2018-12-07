const tdp = require('tera-data-parser')

//https://stackoverflow.com/a/41328397
function concatMaps(map, ...iterables) {
	for (const iterable of iterables) {
		for (const item of iterable) {
			map.set(...item);
		}
	}
}

function importCustomDefs(mod){
	// Load the custom protocol & sysmsg data.
	const customTeraDataPath = require.resolve('./ando-tera-data')
	tdp.protocol.load(customTeraDataPath);

	// Merge the protocol / opcodes.
	for (var [key, value] of tdp.protocol.maps.entries()) {

		// If it already has something for this protocol version, add to it.
		if (mod.dispatch.protocol.maps.has(key)) {
			var curProtocol = mod.dispatch.protocol.maps.get(key);
			concatMaps(curProtocol.code, value.code);
			concatMaps(curProtocol.name, value.name);
		} else {
			mod.dispatch.protocol.maps.set(key, value);
		}
	}

	// Merge the defs
	for (var [key, value] of tdp.protocol.messages.entries()) {

		// If it already has defs for this packet name, add the defs to it.
		if (mod.dispatch.protocol.messages.has(key)) {
			var curMessage = mod.dispatch.protocol.messages.get(key);
			concatMaps(curMessage, value);
		} else {
			mod.dispatch.protocol.messages.set(key, value);
		}
	}
}



module.exports = function FakeName(mod) {
	importCustomDefs(mod);

	mod.command.add('fakename', {
		$default() {
			mod.hookOnce('C_REQUEST_USABLE_CHARACTER_NAME', 1, {}, event => {
				mod.send('S_RESULT_USABLE_CHARACTER_NAME', 1, {
					result: 0
				});
			});

			mod.hookOnce('C_REQUEST_CHANGE_CHARACTER_NAME', 1, {}, event => {
				mod.send('S_RESULT_CHANGE_CHARACTER_NAME', 1, {
					ok: true
				});


				mod.send('S_USER_CHANGE_NAME', 1, {
					gameId: mod.game.me.gameId,
					name: event.name
				});

				return false;
			});

			mod.send('S_OPEN_CHANGE_CHARACTER_NAME_POPUP', 1, {});
		}
	});
}
