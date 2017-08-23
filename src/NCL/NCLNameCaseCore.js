/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

import NCL from './NCL.js';
import NCLStr from './NCLStr.js';
import NCLNameCaseWord from './NCLNameCaseWord.js';

var math_min = require('locutus/php/math/min');
var math_max = require('locutus/php/math/max');
var mb_strtolower = require('locutus/php/strings/strtolower');
var explode = require('locutus/php/strings/explode');
var implode = require('locutus/php/strings/implode');
var trim = require('locutus/php/strings/trim');
var is_null = require('locutus/php/var/is_null');
var is_array = require('locutus/php/var/is_array');
var array_fill = require('locutus/php/array/array_fill');
var in_array = require('locutus/php/array/in_array');
var array_key_exists = require('locutus/php/array/array_key_exists'),
    key_exists = array_key_exists;

/**
 * <b>NCL NameCase Core</b>
 *
 * Набор основных функций, который позволяют сделать интерфейс слонения русского и украниского языка
 * абсолютно одинаковым. Содержит все функции для внешнего взаимодействия с библиотекой.
 *
 * @author Андрей Чайка <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCLNameCaseCore extends NCL
{

    constructor() {
        super();

        /**
         * Версия библиотеки
         * @var string
         */
        this._version = '0.4.1';
        /**
         * Версия языкового файла
         * @var string
         */
        this._languageBuild = '0';
        /**
         * Готовность системы:
         * - Все слова идентифицированы (известо к какой части ФИО относится слово)
         * - У всех слов определен пол
         * Если все сделано стоит флаг true, при добавлении нового слова флаг сбрасывается на false
         * @var bool
         */
        this.ready = false;
        /**
         * Если все текущие слова было просклонены и в каждом слове уже есть результат склонения,
         * тогда true. Если было добавлено новое слово флаг збрасывается на false
         * @var bool
         */
        this.finished = false;
        /**
         * Массив содержит елементы типа NCLNameCaseWord. Это все слова которые нужно обработать и просклонять
         * @var array
         */
        this.words = [];
        /**
         * Переменная, в которую заносится слово с которым сейчас идет работа
         * @var string
         */
        this.workingWord = '';
        /**
         * Метод Last() вырезает подстроки разной длины. Посколько одинаковых вызовов бывает несколько,
         * то все результаты выполнения кешируются в этом массиве.
         * @var array
         */
        this.workindLastCache = [];
        /**
         * Номер последнего использованого правила, устанавливается методом Rule()
         * @var int
         */
        this.lastRule = 0;
        /**
         * Массив содержит результат склонения слова - слово во всех падежах
         * @var array
         */
        this.lastResult = [];
        /**
         * Массив содержит информацию о том какие слова из массива <var>$this->words</var> относятся к
         * фамилии, какие к отчеству а какие к имени. Массив нужен потому, что при добавлении слов мы не
         * всегда знаем какая часть ФИО сейчас, поэтому после идентификации всех слов генерируется массив
         * индексов для быстрого поиска в дальнейшем.
         * @var array
         */
        this.index = {};

        this.gender_koef = 0; //вероятность автоопредления пола [0..10]. Достаточно точно при 0.1
    }
         

    /**
     * Метод очищает результаты последнего склонения слова. Нужен при склонении нескольких слов.
     */
    reset ()
    {
        this.lastRule = 0;
        this.lastResult = [];
    }


    /**
     * Сбрасывает все информацию на начальную. Очищает все слова добавленые в систему.
     * После выполнения система готова работать с начала.
     * @return NCLNameCaseCore
     */
    fullReset ()
    {
        this.words = [];
        this.index = {'N' : [], 'F' : [], 'S' : []};
        this.reset();
        this.notReady();
        return this;
    };


    /**
     * Устанавливает флаги о том, что система не готово и слова еще не были просклонены
     */
    notReady ()
    {
        this.ready = false;
        this.finished = false;
    }


    /**
     * Устанавливает номер последнего правила
     * @param int $index номер правила которое нужно установить
     */
    Rule (index)
    {
        this.lastRule = index;
    }


    /**
     * Устанавливает слово текущим для работы системы. Очищает кеш слова.
     * @param string $word слово, которое нужно установить
     */
    setWorkingWord (word)
    {
        //Сбрасываем настройки
        this.reset();
        //Ставим слово
        this.workingWord = word;
        //Чистим кеш
        this.workindLastCache = [];
    }


    /**
     * Если не нужно склонять слово, делает результат таким же как и именительный падеж
     */
    makeResultTheSame ()
    {
        this.lastResult = array_fill(0, this.CaseCount, this.workingWord);
    }


    /**
     * Если <var>$stopAfter</var> = 0, тогда вырезает $length последних букв с текущего слова (<var>$this->workingWord</var>)
     * Если нет, тогда вырезает <var>$stopAfter</var> букв начиная от <var>$length</var> с конца
     * @param int $length количество букв с конца
     * @param int $stopAfter количество букв которые нужно вырезать (0 - все)
     * @return string требуемая подстрока
     */
    Last (length = 1, stopAfter = 0)
    {
        //Сколько букв нужно вырезать все или только часть
        if (!stopAfter)
        {
            var cut = length;
        }
        else
        {
            cut = stopAfter;
        }

        //Проверяем кеш
        if (this.workindLastCache[length] == undefined)
            this.workindLastCache[length] = [];
        if (this.workindLastCache[length][stopAfter] == undefined)
        {
            this.workindLastCache[length][stopAfter] = NCLStr.substr(this.workingWord, -length, cut);
        }
        return this.workindLastCache[length][stopAfter];
    }



    /**
     * Над текущим словом (<var>$this->workingWord</var>) выполняются правила в порядке указаном в <var>$rulesArray</var>.
     * <var>$gender</var> служит для указания какие правила использовать мужские ('man') или женские ('woman')
     * @param string $gender - префикс мужских/женских правил
     * @param array $rulesArray - массив, порядок выполнения правил
     * @return boolean если правило было задествовано, тогда true, если нет - тогда false
     */
    RulesChain (gender, rulesArray)
    {
        for (var ruleID of rulesArray) {
            var ruleMethod = gender  + 'Rule' + ruleID;
            if (typeof this[ruleMethod] != 'function')
                throw new Exception("Method " + ruleMethod + " not found");
            if (this[ruleMethod]())
            {
                return true;
            }
        }
        return false;
    }



    /**
     * Если <var>$string</var> строка, тогда проверяется входит ли буква <var>$letter</var> в строку <var>$string</var>
     * Если <var>$string</var> массив, тогда проверяется входит ли строка <var>$letter</var> в массив <var>$string</var>
     * @param string $letter буква или строка, которую нужно искать
     * @param mixed $string строка или массив, в котором нужно искать
     * @return bool true если искомое значение найдено
     */
    in (letter, string)
    {
        //Если второй параметр массив
        if (is_array(string))
        {
            return in_array(letter, string);
        }
        else
        {
            if (!letter || NCLStr.strpos(string, letter) === false)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }



    /**
     * Функция проверяет, входит ли имя <var>$nameNeedle</var> в перечень имен <var>$names</var>.
     * @param string $nameNeedle - имя которое нужно найти
     * @param array $names - перечень имен в котором нужно найти имя
     */
    inNames (nameNeedle, names)
    {
        if (!is_array(names))
        {
            names = [names];
        }

        for (var name of names) {
            if (NCLStr.strtolower(nameNeedle) == NCLStr.strtolower(name))
            {
                return true;
            }
        }
        return false;
    }



    /**
     * Склоняет слово <var>$word</var>, удаляя из него <var>$replaceLast</var> последних букв
     * и добавляя в каждый падеж окончание из массива <var>$endings</var>.
     * @param string $word слово, к которому нужно добавить окончания
     * @param array $endings массив окончаний
     * @param int $replaceLast сколько последних букв нужно убрать с начального слова
     */
    wordForms (word, endings, replaceLast = 0)
    {
        //Создаем массив с именительный падежом
        var result = [this.workingWord];
        //Убираем в окончание лишние буквы
        word = NCLStr.substr(word, 0, NCLStr.strlen(word) - replaceLast);

        //Добавляем окончания
        for (var padegIndex = 1; padegIndex < this.CaseCount; padegIndex++)
        {
            result[padegIndex] = word + endings[padegIndex - 1];
        }

        this.lastResult = result;
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$firstname</var> и пометкой, что это имя
     * @param string $firstname имя
     * @return NCLNameCaseCore
     */
    setFirstName (firstname = "")
    {
        if (firstname)
        {
            var newWord = new NCLNameCaseWord(firstname);
            newWord.setNamePart('N');
            this.words.push(newWord);
            this.notReady();
        }
        return this;
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$secondname</var> и пометкой, что это фамилия
     * @param string $secondname фамилия
     * @return NCLNameCaseCore
     */
    setSecondName (secondname = "")
    {
        if (secondname)
        {
            var newWord = new NCLNameCaseWord(secondname);
            newWord.setNamePart('S');
            this.words.push(newWord);
            this.notReady();
        }
        return this;
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$fathername</var> и пометкой, что это отчество
     * @param string $fathername отчество
     * @return NCLNameCaseCore
     */
    setFatherName (fathername = "")
    {
        if (fathername)
        {
            var newWord = new NCLNameCaseWord(fathername);
            newWord.setNamePart('F');
            this.words.push(newWord);
            this.notReady();
        }
        return this;
    }



    /**
     * Всем словам устанавливается пол, который может иметь следующие значения
     * - 0 - не определено
     * - NCL::$MAN - мужчина
     * - NCL::$WOMAN - женщина
     * @param int $gender пол, который нужно установить
     * @return NCLNameCaseCore
     */
    setGender (gender = 0)
    {
        for (var word of this.words) {
            word.setTrueGender(gender);
        }
        return this;
    }



    /**
     * В система заносится сразу фамилия, имя, отчество
     * @param string $secondName фамилия
     * @param string $firstName имя
     * @param string $fatherName отчество
     * @return NCLNameCaseCore
     */
    setFullName (secondName = "", firstName = "", fatherName = "")
    {
        this.setFirstName(firstName);
        this.setSecondName(secondName);
        this.setFatherName(fatherName);
        return this;
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$firstname</var> и пометкой, что это имя
     * @param string $firstname имя
     * @return NCLNameCaseCore
     */
    setName (firstname = "")
    {
        return this.setFirstName(firstname);
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$secondname</var> и пометкой, что это фамилия
     * @param string $secondname фамилия
     * @return NCLNameCaseCore
     */
    setLastName (secondname = "")
    {
        return this.setSecondName(secondname);
    }



    /**
     * В массив <var>$this->words</var> добавляется новый об’єкт класса NCLNameCaseWord
     * со словом <var>$secondname</var> и пометкой, что это фамилия
     * @param string $secondname фамилия
     * @return NCLNameCaseCore
     */
    setSirName (secondname = "")
    {
        return this.setSecondName(secondname);
    }



    /**
     * Если слово <var>$word</var> не идентифицировано, тогда определяется это имя, фамилия или отчество
     * @param NCLNameCaseWord $word слово которое нужно идентифицировать
     */
    prepareNamePart (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        if (!word.getNamePart())
        {
            this.detectNamePart(word);
        }
    }

    /**
     * Проверяет все ли слова идентифицированы, если нет тогда для каждого определяется это имя, фамилия или отчество
     */
    prepareAllNameParts ()
    {
            for (var word of this.words) {
                this.prepareNamePart(word);
            }
    }

    /**
     * Определяет пол для слова <var>$word</var>
     * @param NCLNameCaseWord $word слово для которого нужно определить пол
     */
    prepareGender (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        if (!word.isGenderSolved())
        {
            var namePart = word.getNamePart();
            switch (namePart)
            {
                case 'N': this.GenderByFirstName(word);
                    break;
                case 'F': this.GenderByFatherName(word);
                    break;
                case 'S': this.GenderBySecondName(word);
                    break;
            }
        }
    }

    /**
     * Для всех слов проверяет определен ли пол, если нет - определяет его
     * После этого расчитывает пол для всех слов и устанавливает такой пол всем словам
     * @return bool был ли определен пол
     */
    solveGender ()
    {
        //Ищем, может гдето пол уже установлен
        for (var word of this.words) {
            if (word.isGenderSolved())
            {
                this.setGender(word.gender());
                return true;
            }
        }

        //Если нет тогда определяем у каждого слова и потом сумируем
        var man = 0;
        var woman = 0;

        for (var word of this.words) {
            this.prepareGender(word);
            var gender = word.getGender();
            man+=gender[NCL.MAN];
            woman+=gender[NCL.WOMAN];
        }

        if (man > woman)
        {
            this.setGender(NCL.MAN);
        }
        else
        {
            this.setGender(NCL.WOMAN);
        }

        return true;
    }

    /**
     * Генерируется массив, который содержит информацию о том какие слова из массива <var>$this->words</var> относятся к
     * фамилии, какие к отчеству а какие к имени. Массив нужен потому, что при добавлении слов мы не
     * всегда знаем какая часть ФИО сейчас, поэтому после идентификации всех слов генерируется массив
     * индексов для быстрого поиска в дальнейшем.
     */
    generateIndex ()
    {
        this.index = {'N' : [], 'S' : [], 'F' : []};
        for (var index in this.words) {
            var word = this.words[index];
            var namepart = word.getNamePart();
            this.index[namepart].push(index);
        }
    }

    /**
     * Выполнет все необходимые подготовления для склонения.
     * Все слова идентфицируются. Определяется пол.
     * Обновляется индекс.
     */
    prepareEverything ()
    {
        if (!this.ready)
        {
            this.prepareAllNameParts();
            this.solveGender();
            this.generateIndex();
            this.ready = true;
        }
    }

    /**
     * По указаным словам определяется пол человека:
     * - 0 - не определено
     * - NCL::$MAN - мужчина
     * - NCL::$WOMAN - женщина
     * @return int текущий пол человека
     */
    genderAutoDetect ()
    {
        this.prepareEverything();

        if (!this.words.length){
            var n=-1;
            var max_koef=-1;
            for (var k in this.words) {
                var word = this.words[k];
                var genders=word.getGender();
                var min=math_min( genders );
                var max=math_max( genders );
                var koef=max-min;
                if (koef>max_koef) {
                    max_koef=koef;
                    n=k;
                }
            }

            if (n>=0){
                if (this.words[n])
                {
                    genders=this.words[n].getGender();
                    min=math_min( genders );
                    max=math_max( genders );
                    this.gender_koef=max-min;

                    return this.words[n].gender();
                }
            }
        }
        return false;
    }



    /**
     * Разбивает строку <var>$fullname</var> на слова и возвращает формат в котором записано имя
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param string $fullname строка, для которой необходимо определить формат
     * @return array формат в котором записано имя массив типа <var>$this->words</var>
     */
    splitFullName (fullname)
    {
        fullname = trim(fullname);
        var list = explode(' ', fullname);

        for (var word of list) {
            this.words.push(new NCLNameCaseWord(word));
        }

        this.prepareEverything();
        var formatArr = [];

        for (var word of this.words) {
            formatArr.push(word.getNamePart());
        }

        return this.words;
    }

    /**
     * Разбивает строку <var>$fullname</var> на слова и возвращает формат в котором записано имя
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param string $fullname строка, для которой необходимо определить формат
     * @return string формат в котором записано имя
     */
    getFullNameFormat (fullname)
    {
        this.fullReset();
        var words = this.splitFullName(fullname);
        var format = '';
        for (var word of words) {
            format += word.getNamePart() + ' ';
        }
        return format;
    }



    /**
     * Склоняет слово <var>$word</var> по нужным правилам в зависимости от пола и типа слова
     * @param NCLNameCaseWord $word слово, которое нужно просклонять
     */
    WordCase (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        var gender = (word.gender() == NCL.MAN ? 'man' : 'woman');

        var namepart = '';

        var name_part_letter=word.getNamePart();
        switch (name_part_letter)
        {
            case 'F': namepart = 'Father';
                break;
            case 'N': namepart = 'First';
                break;
            case 'S': namepart = 'Second';
                break;
        }

        var method = gender + namepart + 'Name';
        if (typeof this[method] != 'function')
            throw new Exception("Method " + method + " not found");

        //если фамилия из 2х слов через дефис
        //http://new.gramota.ru/spravka/buro/search-answer?s=273912

        //рабоиваем слово с дефисами на части
        var tmp=word.getWordOrig();
        var cur_words=explode('-', tmp);
        var o_cur_words=[];

        var result={};
        var last_rule=-1;

        var cnt=cur_words.length;
        for (var k in cur_words) {
            var cur_word = cur_words[k];
            var is_norm_rules=true;

            var o_ncw=new NCLNameCaseWord(cur_word);
            if ( name_part_letter=='S' && cnt>1 && k<cnt-1 ){
                //если первая часть фамилии тоже фамилия, то склоняем по общим правилам
                //иначе не склоняется

                var exclusion=['тулуз'];//исключения
                var cur_word_=mb_strtolower(cur_word);
                if ( !in_array(cur_word_, exclusion ) ){
                    var cls = NCL.getConcreteClass('ru');
                    var o_nc = new cls();
                    o_nc.detectNamePart( o_ncw );
                    is_norm_rules=( o_ncw.getNamePart()=='S' );
                }
                else {
                    is_norm_rules=false;
                }
            }

            this.setWorkingWord(cur_word);

            if (is_norm_rules && this[method]())
            {
                //склоняется
                var result_tmp=this.lastResult;
                last_rule=this.lastRule;
            }
            else
            {
                //не склоняется. Заполняем что есть
                result_tmp=array_fill(0, this.CaseCount, cur_word);
                last_rule=-1;
            }
            o_ncw.setNameCases(result_tmp);
            o_cur_words.push(o_ncw);
        }

        //объединение пачку частей слова в одно слово по каждому падежу
        for (var o_ncw of o_cur_words) {
            var namecases=o_ncw.getNameCases();
            for (var k in namecases) {
                var namecase = namecases[k];
                if ( key_exists(k, result) ) result[k]=result[k] + '-' + namecase;
                else result[k]=namecase;
            }
        }

        //устанавливаем падежи для целого слова
        word.setNameCases(result, false);
        word.setRule(last_rule);
    }

    /**
     * Производит склонение всех слов, который хранятся в массиве <var>$this->words</var>
     */
    AllWordCases ()
    {
        if (!this.finished)
        {
            this.prepareEverything();

            for (var word of this.words) {
                this.WordCase(word);
            }

            this.finished = true;
        }
    }

    /**
     * Если указан номер падежа <var>$number</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param NCLNameCaseWord $word слово для котрого нужно вернуть падеж
     * @param int $number номер падежа, который нужно вернуть
     * @return mixed массив или строка с нужным падежом
     */
    getWordCase (/*NCLNameCaseWord*/ word, number = null)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        var cases = word.getNameCases();
        if (is_null(number) || number < 0 || number > (this.CaseCount - 1))
        {
            return cases;
        }
        else
        {
            return cases[number];
        }
    }

    /**
     * Если нужно было просклонять несколько слов, то их необходимо собрать в одну строку.
     * Эта функция собирает все слова указаные в <var>$indexArray</var>  в одну строку.
     * @param array $indexArray индексы слов, которые необходимо собрать вместе
     * @param int $number номер падежа
     * @return mixed либо массив со всеми падежами, либо строка с одним падежом
     */
    getCasesConnected (indexArray, number = null)
    {
        var readyArr = {};
        for (var index of indexArray) {
            readyArr.push(getWordCase(words[index], number));
        }

        var all = readyArr.length;
        if (all)
        {
            if (is_array(readyArr[0]))
            {
                //Масив нужно скелить каждый падеж
                var resultArr = [];
                for (var kase = 0; kase < this.CaseCount; kase++)
                {
                    var tmp = {};
                    for (var i = 0; i < all; i++)
                    {
                        tmp.push(readyArr[i][kase]);
                    }
                    resultArr[kase] = implode(' ', tmp);
                }
                return resultArr;
            }
            else
            {
                return implode(' ', readyArr);
            }
        }
        return '';
    }

    /**
     * Функция ставит имя в нужный падеж.
     *
     * Если указан номер падежа <var>$number</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param int $number номер падежа
     * @return mixed массив или строка с нужным падежом
     */
    getFirstNameCase (number = null)
    {
        this.AllWordCases();

        return this.getCasesConnected(this.index['N'], number);
    }



    /**
     * Функция ставит фамилию в нужный падеж.
     *
     * Если указан номер падежа <var>$number</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param int $number номер падежа
     * @return mixed массив или строка с нужным падежом
     */
    getSecondNameCase (number = null)
    {
        this.AllWordCases();

        return this.getCasesConnected(this.index['S'], number);
    }



    /**
     * Функция ставит отчество в нужный падеж.
     *
     * Если указан номер падежа <var>$number</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param int $number номер падежа
     * @return mixed массив или строка с нужным падежом
     */
    getFatherNameCase (number = null)
    {
        this.AllWordCases();

        return this.getCasesConnected(this.index['F'], number);
    }


    /**
     * Функция ставит имя <var>$firstName</var> в нужный падеж <var>$CaseNumber</var> по правилам пола <var>$gender</var>.
     *
     * Если указан номер падежа <var>$CaseNumber</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param string $firstName имя, которое нужно просклонять
     * @param int $CaseNumber номер падежа
     * @param int $gender пол, который нужно использовать
     * @return mixed массив или строка с нужным падежом
     */
    qFirstName (firstName, CaseNumber = null, gender = 0)
    {
        this.fullReset();
        this.setFirstName(firstName);
        if (gender)
        {
            this.setGender(gender);
        }
        return this.getFirstNameCase(CaseNumber);
    }


    /**
     * Функция ставит фамилию <var>$secondName</var> в нужный падеж <var>$CaseNumber</var> по правилам пола <var>$gender</var>.
     *
     * Если указан номер падежа <var>$CaseNumber</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param string $secondName фамилия, которую нужно просклонять
     * @param int $CaseNumber номер падежа
     * @param int $gender пол, который нужно использовать
     * @return mixed массив или строка с нужным падежом
     */
    qSecondName (secondName, CaseNumber = null, gender = 0)
    {
        this.fullReset();
        this.setSecondName(secondName);
        if (gender)
        {
            this.setGender(gender);
        }

        return this.getSecondNameCase(CaseNumber);
    }


    /**
     * Функция ставит отчество <var>$fatherName</var> в нужный падеж <var>$CaseNumber</var> по правилам пола <var>$gender</var>.
     *
     * Если указан номер падежа <var>$CaseNumber</var>, тогда возвращается строка с таким номером падежа,
     * если нет, тогда возвращается массив со всеми падежами текущего слова.
     * @param string $fatherName отчество, которое нужно просклонять
     * @param int $CaseNumber номер падежа
     * @param int $gender пол, который нужно использовать
     * @return mixed массив или строка с нужным падежом
     */
    qFatherName (fatherName, CaseNumber = null, gender = 0)
    {
        this.fullReset();
        this.setFatherName(fatherName);
        if (gender)
        {
            this.setGender(gender);
        }
        return this.getFatherNameCase(CaseNumber);
    }


    /**
     * Склоняет текущие слова во все падежи и форматирует слово по шаблону <var>$format</var>
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param string $format строка формат
     * @return array массив со всеми падежами
     */
    getFormattedArray (format)
    {
        if (is_array(format))
        {
            return this.getFormattedArrayHard(format);
        }

        var length = NCLStr.strlen(format);
        var result = [];
        var cases = {};
        cases['S'] = this.getCasesConnected(index['S']);
        cases['N'] = this.getCasesConnected(index['N']);
        cases['F'] = this.getCasesConnected(index['F']);

        for (var curCase = 0; curCase < this.CaseCount; curCase++)
        {
            var line = "";
            for (var i = 0; i < length; i++)
            {
                var symbol = NCLStr.substr(format, i, 1);
                if (symbol == 'S')
                {
                    line+= cases['S'][curCase];
                }
                else if (symbol == 'N')
                {
                    line+= cases['N'][curCase];
                }
                else if (symbol == 'F')
                {
                    line+= cases['F'][curCase];
                }
                else
                {
                    line+= symbol;
                }
            }
            result.push(line);
        }
        return result;
    }



    /**
     * Склоняет текущие слова во все падежи и форматирует слово по шаблону <var>$format</var>
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param array $format массив с форматом
     * @return array массив со всеми падежами
     */
    getFormattedArrayHard (format)
    {
        var result = [];
        var cases = [];
        for (var word of format) {
            cases.push(word.getNameCases());
        }

        for (var curCase = 0; curCase < this.CaseCount; curCase++)
        {
            var line = "";
            for (var value of cases) {
                line+= value[curCase] + ' ';
            }
            result.push(trim(line));
        }
        return result;
    }



    /**
     * Склоняет текущие слова в падеж <var>$caseNum</var> и форматирует слово по шаблону <var>$format</var>
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param array $format массив с форматом
     * @return string строка в нужном падеже
     */
    getFormattedHard (caseNum = 0, format = [])
    {
        var result = "";
        for (var word of format) {
            var cases = word.getNameCases();
            result+= cases[caseNum] + ' ';
        }
        return trim(result);
    };



    /**
     * Склоняет текущие слова в падеж <var>$caseNum</var> и форматирует слово по шаблону <var>$format</var>
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param string $format строка с форматом
     * @return string строка в нужном падеже
     */
    getFormatted (caseNum = 0, format = "S N F")
    {
        this.AllWordCases();
        //Если не указан падеж используем другую функцию
        if (is_null(caseNum) || !caseNum)
        {
            return this.getFormattedArray(format);
        }
        //Если формат сложный
        else if (is_array(format))
        {
            return this.getFormattedHard(caseNum, format);
        }
        else
        {
            var length = NCLStr.strlen(format);
            var result = "";
            for (var i = 0; i < length; i++)
            {
                var symbol = NCLStr.substr(format, i, 1);
                if (symbol == 'S')
                {
                    result+= this.getSecondNameCase(caseNum);
                }
                else if (symbol == 'N')
                {
                    result+= this.getFirstNameCase(caseNum);
                }
                else if (symbol == 'F')
                {
                    result+= this.getFatherNameCase(caseNum);
                }
                else
                {
                    result+= symbol;
                }
            }
            return result;
        }
    }


    /**
     * Склоняет фамилию <var>$secondName</var>, имя <var>$firstName</var>, отчество <var>$fatherName</var>
     * в падеж <var>$caseNum</var> по правилам пола <var>$gender</var> и форматирует результат по шаблону <var>$format</var>
     * <b>Формат:</b>
     * - S - Фамилия
     * - N - Имя
     * - F - Отчество
     * @param string $secondName фамилия
     * @param string $firstName имя
     * @param string $fatherName отчество
     * @param int $gender пол
     * @param int $caseNum номер падежа
     * @param string $format формат
     * @return mixed либо массив со всеми падежами, либо строка
     */
    qFullName (secondName = "", firstName = "", fatherName = "", gender = 0, caseNum = 0, format = "S N F")
    {
        this.fullReset();
        this.setFirstName(firstName);
        this.setSecondName(secondName);
        this.setFatherName(fatherName);
        if (gender)
        {
            this.setGender(gender);
        }

        return this.getFormatted(caseNum, format);
    }


    /**
     * Склоняет ФИО <var>$fullname</var> в падеж <var>$caseNum</var> по правилам пола <var>$gender</var>.
     * Возвращает результат в таком же формате, как он и был.
     * @param string $fullname ФИО
     * @param int $caseNum номер падежа
     * @param int $gender пол человека
     * @return mixed либо массив со всеми падежами, либо строка
     */
    q (fullname, caseNum = null, gender = null)
    {
        this.fullReset();
        var format = this.splitFullName(fullname);
        if (gender)
        {
            this.setGender(gender);
        }

        return this.getFormatted(caseNum, format);
    }


    /**
     * Определяет пол человека по ФИО
     * @param string $fullname ФИО
     * @return int пол человека
     */
    genderDetect (fullname)
    {
        this.fullReset();
        this.splitFullName(fullname);
        return this.genderAutoDetect();
    }


    /**
     * Возвращает внутренний массив $this->words каждая запись имеет тип NCLNameCaseWord
     * @return array Массив всех слов в системе
     */
    getWordsArray ()
    {
        return this.words;
    }


    /**
     * Функция пытается применить цепочку правил для мужских имен
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    manFirstName ()
    {
        return false;
    }


    /**
     * Функция пытается применить цепочку правил для женских имен
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    womanFirstName ()
    {
        return false;
    }


    /**
     * Функция пытается применить цепочку правил для мужских фамилий
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    manSecondName ()
    {
        return false;
    }


    /**
     * Функция пытается применить цепочку правил для женских фамилий
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    womanSecondName ()
    {
        return false;
    }


    /**
     * Функция склоняет мужский отчества
     * @return boolean true - если слово было успешно изменено, false - если не получилось этого сделать
     */
    manFatherName ()
    {
        return false;
    }


    /**
     * Функция склоняет женские отчества
     * @return boolean true - если слово было успешно изменено, false - если не получилось этого сделать
     */
    womanFatherName ()
    {
        return false;
    }


    /**
     * Определение пола по правилам имен
     * @param NCLNameCaseWord $word обьект класса слов, для которого нужно определить пол
     */
    GenderByFirstName (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");
    }


    /**
     * Определение пола по правилам фамилий
     * @param NCLNameCaseWord $word обьект класса слов, для которого нужно определить пол
     */
    GenderBySecondName (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");
    }


    /**
     * Определение пола по правилам отчеств
     * @param NCLNameCaseWord $word обьект класса слов, для которого нужно определить пол
     */
    GenderByFatherName (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");
    }


    /**
     * Идетифицирует слово определяе имя это, или фамилия, или отчество
     * - <b>N</b> - имя
     * - <b>S</b> - фамилия
     * - <b>F</b> - отчество
     * @param NCLNameCaseWord $word обьект класса слов, который необходимо идентифицировать
     */
    detectNamePart (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");
    }

    /**
     * Возвращает версию библиотеки
     * @return string версия библиотеки
     */
    version ()
    {
        return this._version;
    }

    /**
     * Возвращает версию использованого языкового файла
     * @return string версия языкового файла
     */
    languageVersion ()
    {
        return this._languageBuild;
    }

}
