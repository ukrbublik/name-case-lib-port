const assert = require('assert');
const {NCLNameCaseUa, NCLNameCaseRu, NCL} = require('../build/index.js');
const fs = require('fs');

const CASES_NAMES = [
    'им. - кто?',
    'род. - кого?',
    'дат. - кому?',
    'вин. - кого?',
    'твор. - кем?',
    'предл. - о ком?',
    'зват. - кто?'
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
                for (let c = 1 ; c < forms.length ; c++) {
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
                    for (let f = 1 ; f < forms.length ; f++) {
                        let expForm = forms[f];
                        let cls = NCL.getConcreteClass(lang);
                        let ncl = new cls;
                        let resForm = ncl.q(basicForm, f);
                        expForm = expForm.replace(/ё/g, 'е');
                        resForm = resForm.replace(/ё/g, 'е');
                        it(CASES_NAMES[f] + ' -> ' + expForm, () => {
                            assert.strictEqual(resForm, expForm);
                        });
                    }
                });
            }
        });
    }
}


//-----------------------------------------------------------------------------


let testSplitFiles = {
    'ua': [
        {
            name: 'ФИО мужские',
            gender: 'm',
            files: {
                f : {
                    file: 'uacrazy/Sirnamesboy.txt',
                    delim: ',',
                },
                i : {
                    file: 'uacrazy/Namesboy.txt',
                    delim: ',',
                },
                o : {
                    file: 'uacrazy/Fatherboy.txt',
                    delim: ',',
                }
            }
        },
        {
            name: 'ФИО женские',
            gender: 'f',
            files: {
                f : {
                    file: 'uacrazy/Sirnamesgirl.txt',
                    delim: ',',
                },
                i : {
                    file: 'uacrazy/Namesgirl.txt',
                    delim: ',',
                },
                o : {
                    file: 'uacrazy/Fathergirl.txt',
                    delim: ',',
                }
            }
        }
    ],
};

for (let lang in testSplitFiles) {
    let groups = testSplitFiles[lang];
    const parts_keys = ['f', 'i', 'o'];
    for (let groupInfo of groups) {
        let fios_parts = {};
        let biggest_part = 'f';
        for (let key of parts_keys) {
            let data = fs.readFileSync(__dirname + '/data/' + groupInfo.files[key].file, groupInfo.files[key].enc || 'utf8');
            let lines = data.split('\n');
            fios_parts[key] = [];
            for (let line of lines) {
                if (!line.length)
                    continue;
                let forms = line.split(groupInfo.files[key].delim || ',');
                if (forms.length < 6)
                    continue;
                fios_parts[key].push(forms);
            }
            if (fios_parts[key].length > fios_parts[biggest_part].length)
                biggest_part = key;
        }

        for (let i = 0 ; i < fios_parts[biggest_part].length ; i++) {
            let parts = {};
            let min_forms = 0;
            for (let key of parts_keys) {
                let j = i % fios_parts[key].length;
                parts[key] = fios_parts[key][j];
                if (min_forms == 0 || parts[key].length < min_forms)
                    min_forms = parts[key].length;
            }

            let forms = [];
            for (let f = 0 ; f < min_forms ; f++) {
                let fio = parts['f'][f] + ' ' + parts['i'][f] + ' ' + parts['o'][f];
                forms.push(fio);
            }
            let basicForm = forms[0];
            describe(basicForm, () => {
                for (let f = 1 ; f < forms.length ; f++) {
                    let expForm = forms[f];
                    let cls = NCL.getConcreteClass(lang);
                    let ncl = new cls;
                    let resForm = ncl.q(basicForm, f);=
                    it(CASES_NAMES[f] + ' -> ' + expForm, () => {
                        assert.strictEqual(resForm, expForm);
                    });
                }
            });
        }
    }
}


//-----------------------------------------------------------------------------

