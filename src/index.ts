import { Squel } from './cls';

const select = Squel.select;
const update = Squel.update;
const insert = Squel.insert;
const delete_ = Squel._delete;
const remove = Squel.remove;
const str = Squel.str;
const rstr = Squel.rstr;
const useFlavour = Squel.useFlavour;
const registerValueHandler = Squel.registerValueHandler;
const expr = Squel.expr;
const case_ = Squel._case;
const mysql = Squel.useFlavour('mysql');
const postgres = Squel.useFlavour('postgres');
const mssql = Squel.useFlavour('mssql');
const VERSION = Squel.VERSION;

export {
    select,
    update,
    insert,
    delete_,
    str,
    rstr,
    useFlavour,
    registerValueHandler,
    expr,
    case_,
    mysql,
    remove,
    postgres,
    mssql,
    VERSION,
};

export default Squel;
