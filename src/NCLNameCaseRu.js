/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

import NCLNameCaseCore from './NCL/NCLNameCaseCore.js';
import NCLNameCaseWord from './NCL/NCLNameCaseWord.js';
import NCLStr from './NCL/NCLStr.js';

var math_min = require('locutus/php/math/min');
var math_max = require('locutus/php/math/max');

/**
 * <b>NCL NameCase Russian Language</b>
 * 
 * Русские правила склонения ФИО
 * Правила определения пола человека по ФИО для русского языка
 * Система разделения фамилий имен и отчеств для русского языка
 * 
 * @author Андрей Чайка <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCLNameCaseRu extends NCLNameCaseCore
{
    constructor() {
        super();

        /**
         * Версия языкового файла
         * @var string 
         */
        this._languageBuild = '11072716';
        /**
         * Количество падежей в языке
         * @var int
         */
        this.CaseCount = 6;
        /**
         * Список гласных русского языка
         * @var string 
         */
        this.vowels = "аеёиоуыэюя";
        /**
         * Список согласных русского языка
         * @var string  
         */
        this.consonant = "бвгджзйклмнпрстфхцчшщ";
        /**
         * Окончания имен/фамилий, который не склоняются
         * @var array 
         */
        this.ovo = ['ово', 'аго', 'яго', 'ирь'];
        /**
         * Окончания имен/фамилий, который не склоняются
         * @var array 
         */
        this.ih = ['их', 'ых', 'ко', 'уа'/*Бенуа, Франсуа*/];
        /**
         * Список окончаний характерных для фамилий 
         * По шаблону {letter}* где * любой символ кроме тех, что в {exclude}
         * @var array of {letter}=>{exclude}
         */
        this.splitSecondExclude = {
            'а' : 'взйкмнпрстфя',
            'б' : 'а',
            'в' : 'аь',
            'г' : 'а',
            'д' : 'ар',
            'е' : 'бвгдйлмня',
            'ё' : 'бвгдйлмня',
            'ж' : '',
            'з' : 'а',
            'и' : 'гдйклмнопрсфя',
            'й' : 'ля',
            'к' : 'аст',
            'л' : 'аилоья',
            'м' : 'аип',
            'н' : 'ат',
            'о' : 'вдлнпря',
            'п' : 'п',
            'р' : 'адикпть',
            'с' : 'атуя',
            'т' : 'аор',
            'у' : 'дмр',
            'ф' : 'аь',
            'х' : 'а',
            'ц' : 'а',
            'ч' : '',
            'ш' : 'а',
            'щ' : '',
            'ъ' : '',
            'ы' : 'дн',
            'ь' : 'я',
            'э' : '',
            'ю' : '',
            'я' : 'нс'
        };

        this.names_man = [
            'Вова', 'Анри', 'Питер', 'Пауль', 'Франц', 'Вильям', 'Уильям',
            'Альфонс', 'Ганс', 'Франс', 'Филиппо', 'Андреа', 'Корнелис', 'Фрэнк', 'Леонардо',
            'Джеймс', 'Отто', 'жан-пьер', 'Джованни', 'Джозеф', 'Педро', 'Адольф', 'Уолтер',
            'Антонио', 'Якоб', 'Эсташ', 'Адрианс', 'Франческо', 'Доменико', 'Ханс', 'Гун',
            'Шарль', 'Хендрик', 'Амброзиус', 'Таддео', 'Фердинанд', 'Джошуа', 'Изак', 'Иоганн',
            'Фридрих', 'Эмиль', 'Умберто', 'Франсуа', 'Ян', 'Эрнст', 'Георг', 'Карл'
        ];
    }


    /**
     * Мужские имена, оканчивающиеся на любой ь и -й, 
     * скло­няются так же, как обычные существительные мужского рода
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule1 ()
    {
        if (this.in(this.Last(1), 'ьй'))
        {
            if (this.inNames(this.workingWord, ['Дель']))
            {
                this.Rule(101);
                this.makeResultTheSame();
                return true;
            }

            if (this.Last(2, 1) != "и")
            {
                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'е'], 1);
                this.Rule(102);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'и'], 1);
                this.Rule(103);
                return true;
            }
        }
        return false;
    }



    /**
     * Мужские имена, оканчивающиеся на любой твердый согласный, 
     * склоняются так же, как обычные существительные мужского рода
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule2 ()
    {
        if (this.in(this.Last(1), this.consonant))
        {
            if (this.inNames(this.workingWord, "Павел"))
            {
                this.lastResult = ["Павел", "Павла", "Павлу", "Павла", "Павлом", "Павле"];
                this.Rule(201);
                return true;
            }
            else if (this.inNames(this.workingWord, "Лев"))
            {
                this.lastResult = ["Лев", "Льва", "Льву", "Льва", "Львом", "Льве"];
                this.Rule(202);
                return true;
            }
            else if (this.inNames(this.workingWord, 'ван'))
            {
                this.Rule(203);
                this.makeResultTheSame();
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
                this.Rule(204);
                return true;
            }
        }
        return false;
    }



    /**
     * Мужские и женские имена, оканчивающиеся на -а, склоняются, как и любые 
     * существительные с таким же окончанием
     * Мужские и женские имена, оканчивающиеся иа -я, -ья, -ия, -ея, независимо от языка, 
     * из которого они происходят, склоняются как существительные с соответствующими окончаниями
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule3 ()
    {
        if (this.Last(1) == "а")
        {
            if (this.inNames(this.workingWord, ['фра', 'Дега', 'Андреа', 'Сёра', 'Сера']))
            {
                this.Rule(301);
                this.makeResultTheSame();
                return true;
            }
            else if (!this.in(this.Last(2, 1), 'кшгх'))
            {
                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(302);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(303);
                return true;
            }
        }
        else if (this.Last(1) == "я")
        {
            this.wordForms(this.workingWord, ['и', 'е', 'ю', 'ей', 'е'], 1);
            this.Rule(303);
            return true;
        }
        return false;
    }



    /**
     * Мужские фамилии, оканчивающиеся на -ь -й, склоняются так же, 
     * как обычные существительные мужского рода
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule4 ()
    {
        if (this.in(this.Last(1), 'ьй'))
        {

            //Слова типа Воробей
            if (this.Last(3) == 'бей')
            {
                this.wordForms(this.workingWord, ['ья', 'ью', 'ья', 'ьем', 'ье'], 2);
                this.Rule(400);
                return true;
            }
            else if (this.Last(3, 1) == 'а' || this.in(this.Last(2, 1), 'ел'))
            {
                this.wordForms(this.workingWord, ['я', 'ю', 'я', 'ем', 'е'], 1);
                this.Rule(401);
                return true;
            }
            //Толстой -» ТолстЫм 
            else if (this.Last(2, 1) == 'ы' || this.Last(3, 1) == 'т')
            {
                this.wordForms(this.workingWord, ['ого', 'ому', 'ого', 'ым', 'ом'], 2);
                this.Rule(402);
                return true;
            }
            //Лесничий
            else if (this.Last(3) == 'чий')
            {
                this.wordForms(this.workingWord, ['ьего', 'ьему', 'ьего', 'ьим', 'ьем'], 2);
                this.Rule(403);
                return true;
            }
            else if (!this.in(this.Last(2, 1), this.vowels) || this.Last(2, 1) == 'и')
            {
                this.wordForms(this.workingWord, ['ого', 'ому', 'ого', 'им', 'ом'], 2);
                this.Rule(404);
                return true;
            }
            else
            {
                this.makeResultTheSame();
                this.Rule(405);
                return true;
            }
        }
        return false;
    }



    /**
     * Мужские фамилии, оканчивающиеся на -к
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule5 ()
    {
        if (this.Last(1) == 'к')
        {
            //Если перед слово на ок, то нужно убрать о
            if (this.Last(4)=='енок' || this.Last(4)=='ёнок')//Поллок
            {
                this.wordForms(this.workingWord, ['ка', 'ку', 'ка', 'ком', 'ке'], 2);
                this.Rule(501);
                return true;
            }
            if (this.Last(2, 1) == 'е' && !in_array(this.Last(3, 1), ['р']))//Лотрек
            {
                this.wordForms(this.workingWord, ['ька', 'ьку', 'ька', 'ьком', 'ьке'], 2);
                this.Rule(502);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
                this.Rule(503);
                return true;
            }
        }
        return false;
    }



    /**
     * Мужские фамили на согласный выбираем ем/ом/ым
     * @return bool true если правило было задействовано и false если нет. 
     */
    manRule6 ()
    {
        if (this.Last(1) == 'ч')
        {
            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ем', 'е']);
            this.Rule(601);
            return true;
        }
        //е перед ц выпадает
        else if (this.Last(2) == 'ец')
        {
            this.wordForms(this.workingWord, ['ца', 'цу', 'ца', 'цом', 'це'], 2);
            this.Rule(604);
            return true;
        }
        else if (this.in(this.Last(1), 'цсршмхт'))
        {
            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
            this.Rule(602);
            return true;
        }
        else if (this.in(this.Last(1), this.consonant))
        {
            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ым', 'е']);
            this.Rule(603);
            return true;
        }
        return false;
    }



    /**
     * Мужские фамили на -а -я
     * @return bool true если правило было задействовано и false если нет.  
     */
    manRule7 ()
    {
        if (this.Last(1) == "а")
        {
            if (this.inNames(this.workingWord, ['да']))
            {
                this.Rule(701);
                this.makeResultTheSame();
                return true;
            }
            //Если основа на ш, то нужно и, ей
            if (this.Last(2, 1) == 'ш')
            {
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                this.Rule(702);
                return true;
            }
            else if (this.in(this.Last(2, 1), 'хкг'))
            {
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(703);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(704);
                return true;
            }
        }
        else if (this.Last(1) == "я")
        {
            this.wordForms(this.workingWord, ['ой', 'ой', 'ую', 'ой', 'ой'], 2);
            this.Rule(705);
            return true;
        }
        return false;
    }



    /**
     * Не склоняются мужский фамилии
     * @return bool true если правило было задействовано и false если нет.  
     */
    manRule8 ()
    {
        if (this.in(this.Last(3), this.ovo) || this.in(this.Last(2), this.ih))
        {
            if ( this.inNames(this.workingWord, ['рерих']) ) return false;
            this.Rule(8);
            this.makeResultTheSame();
            return true;
        }
        return false;
    }



    /**
     * Мужские и женские имена, оканчивающиеся на -а, склоняются, 
     * как и любые существительные с таким же окончанием
     * @return bool true если правило было задействовано и false если нет. 
     */
    womanRule1 ()
    {
        if (this.Last(1) == "а" && this.Last(2, 1) != 'и')
        {
            if (!this.in(this.Last(2, 1), 'шхкг'))
            {
                this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(101);
                return true;
            }
            else
            {
                //ей посля шиплячего
                if (this.Last(2, 1) == 'ш')
                {
                    this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                    this.Rule(102);
                    return true;
                }
                else
                {
                    this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                    this.Rule(103);
                    return true;
                }
            }
        }
        return false;
    }



    /**
     * Мужские и женские имена, оканчивающиеся иа -я, -ья, -ия, -ея, независимо от языка, 
     * из которого они происходят, склоняются как сущест­вительные с соответствующими окончаниями
     * @return bool true если правило было задействовано и false если нет.  
     */
    womanRule2 ()
    {
        if (this.Last(1) == "я")
        {
            if (this.Last(2, 1) != "и")
            {
                this.wordForms(this.workingWord, ['и', 'е', 'ю', 'ей', 'е'], 1);
                this.Rule(201);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['и', 'и', 'ю', 'ей', 'и'], 1);
                this.Rule(202);
                return true;
            }
        }
        return false;
    }



    /**
     * Русские женские имена, оканчивающиеся на мягкий согласный, склоняются, 
     * как существительные женского рода типа дочь, тень
     * @return bool true если правило было задействовано и false если нет. 
     */
    womanRule3 ()
    {
        if (this.Last(1) == "ь")
        {
            this.wordForms(this.workingWord, ['и', 'и', 'ь', 'ью', 'и'], 1);
            this.Rule(3);
            return true;
        }
        return false;
    }



    /**
     * Женские фамилия, оканчивающиеся на -а -я, склоняются,
     * как и любые существительные с таким же окончанием
     * @return bool true если правило было задействовано и false если нет. 
     */
    womanRule4 ()
    {
        if (this.Last(1) == "а")
        {
            if (this.in(this.Last(2, 1), 'гк'))
            {
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ой', 'е'], 1);
                this.Rule(401);
                return true;
            }
            else if (this.in(this.Last(2, 1), 'ш'))
            {
                this.wordForms(this.workingWord, ['и', 'е', 'у', 'ей', 'е'], 1);
                this.Rule(402);
                return true;
            }
            else
            {
                this.wordForms(this.workingWord, ['ой', 'ой', 'у', 'ой', 'ой'], 1);
                this.Rule(403);
                return true;
            }
        }
        else if (this.Last(1) == "я")
        {
            this.wordForms(this.workingWord, ['ой', 'ой', 'ую', 'ой', 'ой'], 2);
            this.Rule(404);
            return true;
        }
        return false;
    }



    /**
     * Функция пытается применить цепочку правил для мужских имен
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    manFirstName ()
    {
        if (this.inNames(this.workingWord, ['Старший', 'Младший']))
        {
            this.wordForms(this.workingWord, ['его', 'ему', 'его', 'им', 'ем'], 2);
            return true;
        }
        if (this.inNames(this.workingWord, ['Мариа']))
        {
            //Альфонс Мария Муха
            this.wordForms(this.workingWord, ['и', 'и', 'ю', 'ей', 'ии'], 1);
            return true;
        }
        return this.RulesChain('man', [1, 2, 3]);
    }



    /**
     * Функция пытается применить цепочку правил для женских имен
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    womanFirstName ()
    {
        return this.RulesChain('woman', [1, 2, 3]);
    }



    /**
     * Функция пытается применить цепочку правил для мужских фамилий
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    manSecondName ()
    {
        return this.RulesChain('man', [8, 4, 5, 6, 7]);
    }



    /**
     * Функция пытается применить цепочку правил для женских фамилий
     * @return boolean true - если было использовано правило из списка, false - если правило не было найденым
     */
    womanSecondName ()
    {
        return this.RulesChain('woman', [4]);
    }



    /**
     * Функция склоняет мужские отчества
     * @return boolean true - если слово было успешно изменено, false - если не получилось этого сделать
     */
    manFatherName ()
    { 
        //Проверяем действительно ли отчество
        if (this.inNames(this.workingWord, 'Ильич'))
        {
            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ом', 'е']);
            return true;
        }
        else if (this.Last(2) == 'ич')
        {
            this.wordForms(this.workingWord, ['а', 'у', 'а', 'ем', 'е']);
            return true;
        }
        return false;
    }



    /**
     * Функция склоняет женские отчества
     * @return boolean true - если слово было успешно изменено, false - если не получилось этого сделать
     */
    womanFatherName ()
    {
        //Проверяем действительно ли отчество
        if (this.Last(2) == 'на')
        {
            this.wordForms(this.workingWord, ['ы', 'е', 'у', 'ой', 'е'], 1);
            return true;
        }
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

        this.setWorkingWord(word.getWord());

        var man = 0; //Мужчина
        var woman = 0; //Женщина
        //Попробуем выжать максимум из имени
        //Если имя заканчивается на й, то скорее всего мужчина
        if (this.Last(1) == 'й')
        {
            man+=0.9;
        }
        if (this.in(this.Last(2), ['он', 'ов', 'ав', 'ам', 'ол', 'ан', 'рд', 'мп', 'по'/*Филиппо*/, 'до'/*Леонардо*/, 'др', 'рт']))
        {
            man+=0.3;
        }
        if (this.in(this.Last(1), this.consonant))
        {
            man+=0.01;
        }
        if (this.Last(1) == 'ь')
        {
            man+=0.02;
        }

        if (this.in(this.Last(2), ['вь', 'фь', 'ль', 'на']))
        {
            woman+=0.1;
        }

        if (this.in(this.Last(2), ['ла']))
        {
            woman+=0.04;
        }

        if (this.in(this.Last(2), ['то', 'ма']))
        {
            man+=0.01;
        }

        if (this.in(this.Last(3), ['лья', 'вва', 'ока', 'ука', 'ита', 'эль'/*Рафаэль, Габриэль*/, 'реа'/*Андреа*/]))
        {
            man+=0.2;
        }

        if (this.in(this.Last(3), ['има']))
        {
            woman+=0.15;
        }

        if (this.in(this.Last(3), ['лия', 'ния', 'сия', 'дра', 'лла', 'кла', 'опа', 'вия']))
        {
            woman+=0.5;
        }

        if (this.in(this.Last(4), ['льда', 'фира', 'нина', 'лита', 'алья']))
        {
            woman+=0.5;
        }
        
        if (this.inNames(this.workingWord, this.names_man))
        {
            man += 10;
        }
        
        if (this.inNames(this.workingWord, ['Бриджет', 'Элизабет', 'Маргарет', 'Джанет', 'Жаклин', 'Эвелин']))
        {
            woman += 10;
        }

        //Исключение для Берил Кук, которая женщина
        if (this.inNames(this.workingWord, ['Берил']))
        {
            woman += 0.05;
        }

        word.setGender(man, woman);
    }



    /**
     * Определение пола по правилам фамилий
     * @param NCLNameCaseWord $word обьект класса слов, для которого нужно определить пол
     */
    GenderBySecondName (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        this.setWorkingWord(word.getWord());

        var man = 0; //Мужчина
        var woman = 0; //Женщина

        if (this.in(this.Last(2), ['ов', 'ин', 'ев', 'ий', 'ёв', 'ый', 'ын', 'ой']))
        {
            man+=0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ина', 'ева', 'ёва', 'ына', 'мин']))
        {
            woman+=0.4;
        }

        if (this.in(this.Last(2), ['ая']))
        {
            woman+=0.4;
        }

        word.setGender(man, woman);
    }



    /**
     * Определение пола по правилам отчеств
     * @param NCLNameCaseWord $word обьект класса слов, для которого нужно определить пол
     */
    GenderByFatherName (/*NCLNameCaseWord*/ word)
    {
        if (!(word instanceof NCLNameCaseWord))
            throw new Exception("word should be of class NCLNameCaseWord");

        this.setWorkingWord(word.getWord());

        if (this.Last(2) == 'ич')
        {
            word.setGender(10, 0); // мужчина
        }
        if (this.Last(2) == 'на')
        {
            word.setGender(0, 12); // женщина
        }
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

        var namepart = word.getWord();
        var length = NCLStr.strlen(namepart);
        this.setWorkingWord(namepart);

        //Считаем вероятность
        var first = 0;
        var second = 0;
        var father = 0;

        //если смахивает на отчество
        if (this.in(this.Last(3), ['вна', 'чна', 'вич', 'ьич']))
        {
            father+=3;
        }

        if (this.in(this.Last(2), ['ша']))
        {
            first+=0.5;
        }

        if (this.in(this.Last(3), ['эль'/*Рафаэль, Габриэль*/]))
        {
            first+=0.5;
        }

        /**
         * буквы на которые никогда не заканчиваются имена
         */
        if (this.in(this.Last(1), 'еёжхцочшщъыэю'))
        {
            /**
             * Просто исключения
             */
            if (this.inNames(namepart, ['Мауриц']))
            {
                first += 10;
            }
            else {
                second += 0.3;
            }
        }

        /**
         * Используем массив характерных окончаний
         */
        if ((this.splitSecondExclude[this.Last(2, 1)]))
        {
            if (!this.in(this.Last(1), this.splitSecondExclude[this.Last(2, 1)]))
            {
                second += 0.4;
            }
        }

        /**
         * Сокращенные ласкательные имена типя Аня Галя и.т.д.
         */
        if (this.Last(1) == 'я' && this.in(this.Last(3, 1), this.vowels))
        {
            first += 0.5;
        }

        /**
         * Не бывает имен с такими предпоследними буквами
         */
        if (this.in(this.Last(2, 1), 'жчщъэю'))
        {
            second += 0.3;
        }

        /**
         * Слова на мягкий знак. Существует очень мало имен на мягкий знак. Все остальное фамилии
         */
        if (this.Last(1) == 'ь')
        {
            /**
             * Имена типа нинЕЛь адЕЛь асЕЛь
             */
            if (this.Last(3, 2) == 'ел')
            {
                first += 0.7;
            }
            /**
             * Просто исключения
             */
            else if (this.inNames(namepart, ['Лазарь', 'Игорь', 'Любовь']))
            {
                first += 10;
            }
            /**
             * Если не то и не другое, тогда фамилия
             */
            else
            {
                second += 0.3;
            }
        }
        /**
         * Если две последних букв согласные то скорее всего это фамилия
         */
        else if (this.in(this.Last(1), this.consonant  + "" +  'ь') && this.in(this.Last(2, 1), this.consonant  + "" +  'ь'))
        {
            /**
             * Практически все кроме тех которые оканчиваются на следующие буквы
             */
            if (!this.in(this.Last(2), ['др', 'кт', 'лл', 'пп', 'рд', 'рк', 'рп', 'рт', 'тр']))
            {
                second += 0.25;
            }
        }

        /**
         * Слова, которые заканчиваются на тин
         */
        if (this.Last(3) == 'тин' && this.in(this.Last(4, 1), 'нст'))
        {
            first += 0.5;
        }

        //Исключения
        if (this.inNames(namepart, [
            'Лев', 'Яков', 'Вова', 'Маша', 'Ольга', 'Еремей',
            'Исак', 'Исаак', 'Ева', 'Ирина', 'Элькин', 'Мерлин', 'Макс', 'Алекс',
            'Мариа'/*Альфонс Мариа Муха*/,
            'Бриджет', 'Элизабет', 'Маргарет', 'Джанет', 'Жаклин', 'Эвелин'/*женские иностранные*/
        ]) || this.inNames(namepart, this.names_man))
        {
            first+=10;
        }

        /**
         * Фамилии которые заканчиваются на -ли кроме тех что типа натАли и.т.д.
         */
        if (this.Last(2) == 'ли' && this.Last(3, 1) != 'а')
        {
            second+=0.4;
        }

        /**
         * Фамилии на -як кроме тех что типа Касьян Куприян + Ян и.т.д.
         */
        if (this.Last(2) == 'ян' && length > 2 && !this.in(this.Last(3, 1), 'ьи'))
        {
            second+=0.4;
        }

        /**
         * Фамилии на -ур кроме имен Артур Тимур
         */
        if (this.Last(2) == 'ур')
        {
            if (!this.inNames(namepart, ['Артур', 'Тимур']))
            {
                second += 0.4;
            }
        }

        /**
         * Разбор ласкательных имен на -ик
         */
        if (this.Last(2) == 'ик')
        {
            /**
             * Ласкательные буквы перед ик
             */
            if (this.in(this.Last(3, 1), 'лшхд'))
            {
                first += 0.3;
            }
            else
            {
                second += 0.4;
            }
        }

        /**
         * Разбор имен и фамилий, который заканчиваются на ина
         */
        if (this.Last(3) == 'ина')
        {
            /**
             * Все похожие на Катерина и Кристина
             */
            if (this.in(this.Last(7), ['атерина', 'ристина']))
            {
                first+=10;
            }
            /**
             * Исключения
             */
            else if (this.inNames(namepart, ['Мальвина', 'Антонина', 'Альбина', 'Агриппина', 'Фаина', 'Карина', 'Марина', 'Валентина', 'Калина', 'Аделина', 'Алина', 'Ангелина', 'Галина', 'Каролина', 'Павлина', 'Полина', 'Элина', 'Мина', 'Нина', 'Дина']))
            {
                first+=10;
            }
            /**
             * Иначе фамилия
             */
            else
            {
                second += 0.4;
            }
        }

        /**
         * Имена типа Николай
         */
        if (this.Last(4) == 'олай')
        {
            first += 0.6;
        }

        /**
         * Фамильные окончания
         */
        if (this.in(this.Last(2), ['ов', 'ин', 'ев', 'ёв', 'ый', 'ын', 'ой', 'ук', 'як', 'ца', 'ун', 'ок', 'ая', 'ёк', 'ив', 'ус', 'ак', 'яр', 'уз', 'ах', 'ай']))
        {
            second+=0.4;
        }

        if (this.in(this.Last(3), ['ова', 'ева', 'ёва', 'ына', 'шен', 'мей', 'вка', 'шир', 'бан', 'чий', 'кий', 'бей', 'чан', 'ган', 'ким', 'кан', 'мар', 'лис']))
        {
            second+=0.4;
        }

        if (this.in(this.Last(4), ['шена']))
        {
            second+=0.4;
        }

        //исключения и частички
        if (this.inNames(namepart, ['да', 'валадон', 'Данбар'])){
            second += 10;
        }


        var max = math_max([first, second, father]);

        if (first == max)
        {
            word.setNamePart('N');
        }
        else if (second == max)
        {
            word.setNamePart('S');
        }
        else
        {
            word.setNamePart('F');
        }
    }

}

