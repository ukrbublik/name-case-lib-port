/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

var mb_substr = require('locutus/php/strings/substr');
var mb_strpos = require('locutus/php/strings/strpos');
var mb_strlen = require('locutus/php/strings/strlen');
var mb_strtolower = require('locutus/php/strings/strtolower');
var mb_strtoupper = require('locutus/php/strings/strtoupper');
var mb_strrpos = require('locutus/php/strings/strrpos');
var mb_split = require('locutus/php/strings/split');
var implode = require('locutus/php/strings/implode');

/**
 * Класс содержит функции для работы со строками, которые используются в NCLNameCaseLib
 * 
 * @author Андрей Чайка <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCLStr
{
    /**
     * Кодировка, в котороя работает система
     * @var string 
     */
    static get charset() { return 'utf-8'; }


    /**
     * Получить подстроку из строки
     * @param string $str строка
     * @param int $start начало подстроки
     * @param int $length длина подстроки
     * @return int подстрока 
     */
    static substr (str, start, length = null) {
        let s = mb_substr(str, start, length, NCLStr.charset);
        if (s === false)
            s = '';
        return s;
    }
     

    /**
     * Поиск подстроки в строке
     * @param string $haystack строка, в которой искать
     * @param string $needle подстрока, которую нужно найти
     * @param int $offset начало поиска
     * @return int позиция подстроки в строке
     */
    static strpos (haystack, needle, offset = 0) {
        return mb_strpos(haystack, needle, offset, NCLStr.charset);
    }
     

    /**
     * Определение длины строки
     * @param string $str строка
     * @return int длина строки
     */
    static strlen (str) {
        return mb_strlen(str, NCLStr.charset);
    }
    

    /**
     * Переводит строку в нижний регистр
     * @param string $str строка
     * @return string строка в нижнем регистре
     */
    static strtolower (str) {
        return mb_strtolower(str, NCLStr.charset);
    }
    

    /**
     * Переводит строку в верхний регистр
     * @param string $str строка
     * @return string строка в верхнем регистре
     */
    static strtoupper (str) {
        return mb_strtoupper(str, NCLStr.charset);
    }
     

    /**
     * Поиск подстроки в строке справа
     * @param string $haystack строка, в которой искать
     * @param string $needle подстрока, которую нужно найти
     * @param int $offset начало поиска
     * @return int позиция подстроки в строке
     */
    static strrpos (haystack, needle, offset = null) {
        return mb_strrpos(haystack, needle, offset, NCLStr.charset);        
    }
    

    /**
     * Проверяет в нижнем ли регистре находится строка
     * @param string $phrase строка
     * @return bool в нижнем ли регистре строка 
     */
    static isLowerCase (phrase) {
        return (phrase == NCLStr.strtolower(phrase));
    }
    

     /**
     * Проверяет в верхнем ли регистре находится строка
     * @param string $phrase строка
     * @return bool в верхнем ли регистре строка 
     */
    static isUpperCase (phrase) {
        return (phrase == NCLStr.strtoupper(phrase));
    }
    
    /**
     * Превращает строку в массив букв
     * @param string $phrase строка
     * @return array массив букв
     */
    static splitLetters (phrase) {
        var resultArr = [];
        var stop = NCLStr.strlen(phrase);
        for (var idx = 0; idx < stop; idx++)
        {
            resultArr.push(NCLStr.substr(phrase, idx, 1));
        }
        return resultArr;
    }
    

    /**
     * Соединяет массив букв в строку
     * @param array $lettersArr массив букв
     * @return string строка
     */
    static connectLetters (lettersArr) {
        return implode('', lettersArr);
    }
     
    
    /**
     * Разбивает строку на части использую шаблон
     * @param string $pattern шаблон разбития
     * @param string $string строка, которую нужно разбить
     * @return array разбитый массив 
     */
    static explode (pattern, string) {
        return mb_split(pattern, string);
    }
     
}

