const axios = require('axios')
const xml2js = require('xml2js');
var parser = new xml2js.Parser();

const _0x88FE88 = 8111253;
const _0xFE88AA = 4544506;
const _0xEE8080 = 13986479;
const _0xA0A0F0 = 16744512;

const _0Xedc3 = function(_0xc5c0x2) {
    var _0xc5c0x3 = _0x88FE88;
    var _0xc5c0x4 = _0xFE88AA;
    var _0xc5c0x5 = _0xEE8080;
    var _0xc5c0x6 = _0xA0A0F0;
    for (var _0xc5c0x7 = 0; _0xc5c0x7 < _0xc5c0x2; ++_0xc5c0x7) {
        _0xc5c0x8()
    }
    ;function _0xc5c0x8() {
        var _0xc5c0x9 = _0xc5c0x3;
        _0xc5c0x9 ^= (_0xc5c0x9 << 11) & 0xFFFFFF;
        _0xc5c0x9 ^= (_0xc5c0x9 >> 8) & 0xFFFFFF;
        _0xc5c0x3 = _0xc5c0x4;
        _0xc5c0x4 = _0xc5c0x5;
        _0xc5c0x5 = _0xc5c0x6;
        _0xc5c0x6 ^= (_0xc5c0x6 >> 19) & 0xFFFFFF;
        _0xc5c0x6 ^= _0xc5c0x9
    }
    return function(_0xc5c0xa) {
        var _0xc5c0xb = _0xc5c0xa ^ (_0xc5c0x3 & 0xFF);
        _0xc5c0x8();
        return _0xc5c0xb
    }
}


const _0xedc3 = ["\x6C\x65\x6E\x67\x74\x68"];
const UInt8Array = function(_0x7f4ax2) {
    var _0x7f4ax3 = new Uint8Array(_0x7f4ax2);
    var _0x7f4ax4 = _0Xedc3(_0x7f4ax3[0]);
    var _0x7f4ax5 = (_0x7f4ax4(_0x7f4ax3[1]) << 16) + (_0x7f4ax4(_0x7f4ax3[2]) << 8) + (_0x7f4ax4(_0x7f4ax3[3]));
    var _0x7f4ax6 = 4;
    var _0x7f4ax7 = new Uint8Array(_0x7f4ax5);
    var _0x7f4ax8 = 0;
    while (_0x7f4ax6 < _0x7f4ax3[_0xedc3[0]] && _0x7f4ax8 < _0x7f4ax5) {
        var _0x7f4ax9 = _0x7f4ax3[_0x7f4ax6];
        _0x7f4ax9 = (_0x7f4ax9 ^ (_0x7f4ax6 & 0xFF)) ^ 0xA3;
        ++_0x7f4ax6;
        for (var _0x7f4axa = 7; _0x7f4axa >= 0; _0x7f4axa--) {
            if ((_0x7f4ax9 & (1 << _0x7f4axa)) == 0) {
                _0x7f4ax7[_0x7f4ax8++] = _0x7f4ax4(_0x7f4ax3[_0x7f4ax6++])
            } else {
                var _0x7f4axb = _0x7f4ax4(_0x7f4ax3[_0x7f4ax6]);
                var _0x7f4axc = (_0x7f4axb >> 4) + 3;
                var _0x7f4axd = (((_0x7f4axb & 0xF) << 8) | _0x7f4ax4(_0x7f4ax3[_0x7f4ax6 + 1])) + 1;
                _0x7f4ax6 += 2;
                for (var _0x7f4axe = 0; _0x7f4axe < _0x7f4axc; _0x7f4axe++) {
                    _0x7f4ax7[_0x7f4ax8] = _0x7f4ax7[_0x7f4ax8++ - _0x7f4axd]
                }
            };
            if (_0x7f4ax6 >= _0x7f4ax3[_0xedc3[0]] && _0x7f4ax7[_0xedc3[0]] >= _0x7f4ax5) {
                break
            }
        }
    };
    return _0x7f4ax7
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


module.exports = function(url, mode = 'json'){
	return axios.get(url,{
	      responseType: 'arraybuffer'
	  }).then(response => {

		const buf = new UInt8Array(response.data);
		
		// const buf = Buffer.from(response.data, 'utf8');
		const text = new TextDecoder("utf-8").decode(buf);
    if(mode === 'json'){
      return JSON.parse(text)
    } else if(mode ==='xml') {
      return parser.parseStringPromise(text)
    }
	})
}

// return
