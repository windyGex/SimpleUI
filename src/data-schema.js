define(function (require) {

    var declare = require('./declare');


    var DataSchema = declare('DataSchema', {


        schema: {
            meta: [],
            listLocator: '*',
            fields: '*'
        },

        schemaFilter: function (data) {

            var schema = this.schema,
                meta = schema.meta || [],
                listLocator = schema.listLocator || '*',
                fields = schema.fields || '*',
                list,
                self = this,
                result = {};

            if(listLocator === '*'){
                list = data;
            }else{
                list = this.getByPath(data, listLocator);
            }

            if (typeof fields === 'string') {
                fields = [fields];
            }

            if (typeof meta === 'string') {
                meta = [meta];
            }

            if(fields[0] != '*'){
                list = list.map(function (item) {
                    var object = {};

                    fields.forEach(function (field) {
                        if (typeof field === 'string') {
                            object[field] = item[field];
                        } else {
                            object[field.key] = item[field.locator];
                        }
                    });
                    return object;

                });
            }



            result.list = list;

            meta.forEach(function (metaItem) {
                if (typeof metaItem === 'string') {
                    result[metaItem] = self.getByPath(data, metaItem);
                } else {
                    result[metaItem.key] = self.getByPath(data, metaItem.locator);
                }
            });

            return result;

        },

        getByPath: function (data, path) {
            var field = path.split('.'),
                val,
                key;

            if (field.length) {
                key = field[0];
                if (key.indexOf('[') >= 0) {
                    key = key.match(/(.*)\[(.*)\]/);
                    if (key) {
                        val = data[key[1]][key[2]];
                    }
                } else {
                    val = data[field[0]];
                }
                if (val) {
                    for (var i = 1; i < field.length; i++) {
                        val = val[field[i]];
                        if (typeof val === 'undefined') {
                            break;
                        }
                    }
                }
            }
            return val;
        }
    });

    return DataSchema;

});