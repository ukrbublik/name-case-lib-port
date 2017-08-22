/**
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 * @package NameCaseLib
 */

/**
 * Класс, который содержит основные константы библиотеки:
 * - индексы мужского и женского пола
 * - индексы всех падежей
 * 
 * @author Андрей Чайка <bymer3@gmail.com>
 * @version 0.4.1
 * @package NameCaseLib
 */
export default class NCL
{
    /**
     * Мужской пол
     * @static integer
     */
    static get MAN() { return 1; }

    /**
     * Женский пол
     * @static integer 
     */
    static get WOMAN() { return 2; }
     


    /**
     * Именительный падеж
     * @static integer 
     */
    static get IMENITLN() { return 0; }
     
    
    /**
     * Родительный падеж
     * @static integer 
     */
    static get RODITLN() { return 1; }
     
    
    /**
     * Дательный падеж
     * @static integer 
     */
    static get DATELN() { return 2; }
     
    
    /**
     * Винительный падеж
     * @static integer 
     */
    static get VINITELN() { return 3; }
     
    
    /**
     * Творительный падеж
     * @static integer 
     */
    static get TVORITELN() { return 4; }
     
    
    /**
     * Предложный падеж
     * @static integer 
     */
    static get PREDLOGN() { return 5; }

    

    /**
     * Назвиний відмінок
     * @static integer 
     */
    static get UaNazyvnyi() { return 0; }
     
    
    /**
     * Родовий відмінок
     * @static integer 
     */
    static get UaRodovyi() { return 1; }
     
    
    /**
     * Давальний відмінок
     * @static integer 
     */
    static get UaDavalnyi() { return 2; }
     
    
    /**
     * Знахідний відмінок
     * @static integer 
     */
    static get UaZnahidnyi() { return 3; }
     
    
    /**
     * Орудний відмінок
     * @static integer 
     */
    static get UaOrudnyi() { return 4; }
     
    
    /**
     * Місцевий відмінок
     * @static integer 
     */
    static get UaMiszevyi() { return 5; }
     
    
    /**
     * Кличний відмінок
     * @static integer 
     */
    static get UaKlychnyi() { return 6; }



    static getConcreteClass(lang) {
        return NCL._concreteClasses && NCL._concreteClasses[lang] ? NCL._concreteClasses[lang] : null;
    }

    static setConcreteClasses (concreteClasses) {
        NCL._concreteClasses = concreteClasses;
    }

}

