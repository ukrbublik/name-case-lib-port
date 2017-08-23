const assert = require('assert');
const {NCLNameCaseUa, NCLNameCaseRu, NCL} = require('../build/index.js');
const fs = require('fs');

const CASES_NAMES = [
    'им. - кто?',
    'род. - кого?',
    'дат. - кому?',
    'вин. - кого?',
    'твор. - кем?',
    'предл. - о ком?'
];

//-----------------------------------------------------------------------------

let testFios = {
    'ru': [
        ["Облогин Денис", "Облогина Дениса", null, null, null, null],
    ],
    'ua': [
        ["Облогін Денис", "Облогіна Дениса", null, null, null, null],
    ]
};

for (let lang in testFios) {
    describe('ФИО' + ' ' + lang, () => {
        let fios = testFios[lang];
        for (let forms of fios) {
            let basicForm = forms[0];
            describe(basicForm, () => {
                for (let c = 1 ; c < Math.min(forms.length, 6) ; c++) {
                    let expForm = forms[c];
                    if (!expForm)
                        continue;
                    let cls = NCL.getConcreteClass(lang);
                    let ncl = new cls;
                    let resForm = ncl.q(basicForm, c);
                    it(CASES_NAMES[c] + ' -> ' + expForm, () => {
                        assert.strictEqual(resForm, expForm);
                    })
                }
            });
        }
    });
}

//-----------------------------------------------------------------------------

let testFiles = {
    'ru': [
        {
            name: 'ФИО мужские',
            file: 'Names/boy_full_result.txt',
            delim: '#',
        },
        {
            name: 'ФИО женские',
            file: 'Names/girl_full_result.txt',
            delim: '#',
        },
    ],
    'ua': [
        {
            name: 'О мужские',
            file: 'uacrazy/Fatherboy.txt',
            delim: ',',
        },
        {
            name: 'О женские',
            file: 'uacrazy/Fathergirl.txt',
            delim: ',',
        },
        {
            name: 'И мужские',
            file: 'uacrazy/Namesboy.txt',
            delim: ',',
        },
        {
            name: 'И женские',
            file: 'uacrazy/Namesgirl.txt',
            delim: ',',
        },
        {
            name: 'Ф мужские',
            file: 'uacrazy/Sirnamesboy.txt',
            delim: ',',
        },
        {
            name: 'Ф женские',
            file: 'uacrazy/Sirnamesgirl.txt',
            delim: ',',
        },
    ],
};

for (let lang in testFiles) {
    let files = testFiles[lang];
    for (let fileInfo of files) {
        let data = fs.readFileSync(__dirname + '/data/' + fileInfo.file, fileInfo.enc || 'utf8');
        let lines = data.split('\n');
        describe(fileInfo.name + ' ' + lang, () => {
            for (let line of lines) {
                if (!line.length)
                    continue;
                let forms = line.split(fileInfo.delim || ',');
                if (forms.length < 6)
                    continue;
                let basicForm = forms[0];
                describe(basicForm, () => {
                    for (let c = 1 ; c < Math.min(forms.length, 6) ; c++) {
                        let expForm = forms[c];
                        let cls = NCL.getConcreteClass(lang);
                        let ncl = new cls;
                        let resForm = ncl.q(basicForm, c);
                        expForm = expForm.replace('ё', 'е');
                        resForm = resForm.replace('ё', 'е');
                        it(CASES_NAMES[c] + ' -> ' + expForm, () => {
                            assert.strictEqual(resForm, expForm);
                        });
                    }
                });
            }
        });
    }
}

//-----------------------------------------------------------------------------

