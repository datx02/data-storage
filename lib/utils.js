module.exports = (function() {

	// Root scope
	var root = this;

	var Q = require("q"),
		URL = this.URL || this.webkitURL;

	// Private

	function blobToObjectURL(blob) {
		return URL.createObjectURL(blob);
	}

	// Public

	return {
		blobToArrayBuffer: function(blob) {
			// Ensure that the blob is actually a blob:
			blob = new Blob([blob], blob.type ? { type: blob.type } : {} );

			var fr = new FileReader();
			var defer = Q.defer();

			fr.onload = function(evt) {
				defer.resolve(evt.target.result);
			}
			fr.onerror = function(err) {
				defer.reject(err);
			}

			fr.readAsArrayBuffer(blob);

			return defer.promise;
		},

		arrayBufferToBinaryString: function(buffer) {
			var fr = new FileReader(),
				defer = Q.defer();

			fr.onload = function(evt) {
				defer.resolve(evt.target.result);
			}
			fr.onerror = function(err) {
				defer.reject(err);
			}

			var uInt8Array = new Uint8Array(buffer);
			fr.readAsBinaryString(new Blob([uInt8Array]));

			return defer.promise;
		},

		arrayBufferToBlob: function(buffer, type) {
			var uInt8Array = new Uint8Array(buffer);
			return new Blob([uInt8Array], type ? {type: type} : {});
		},

		toObjectURL: function(data, type) {
			if(data instanceof Blob) {
				return blobToObjectURL(data);
			}
			else if(data instanceof ArrayBuffer) {
				return blobToObjectURL( this.arrayBufferToBlob(data, type) );
			}

			return blobToObjectURL(new Blob([data], {type: type || {} }));
		},

		dataURLToBlob: function(dataURL) {
			var BASE64_MARKER = ';base64,';
			if (dataURL.indexOf(BASE64_MARKER) == -1) {
				var parts = dataURL.split(','),
					contentType = parts[0].split(':')[1],
					raw = parts[1];

				return new Blob([raw], {type: contentType});
			}

			var parts = dataURL.split(BASE64_MARKER),
				contentType = parts[0].split(':')[1],
				raw = window.atob(parts[1]),
				rawLength = raw.length;

			var uInt8Array = new Uint8Array(rawLength);

			for (var i = 0; i < rawLength; ++i) {
				uInt8Array[i] = raw.charCodeAt(i);
			}

			return new Blob([uInt8Array], {type: contentType});
		},

		blobToJSON: function(blob) {
			return this.blobToArrayBuffer(blob).then(function(buffer) {
				return Q.fcall(function() {
					return { data: buffer, type: blob.type };
				});
			});
		}
	};

})();
