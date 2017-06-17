/**
 * Created by Alexey on 16.06.2017.
 */
window.GeneratorProject = {};
GeneratorProject.Models = {};
GeneratorProject.Collections = {};
/**********************************/
GeneratorProject.Models.ColumnModel = Backbone.Model.extend({
    defaults: {
        columnID: 0,
        columnName: '',
        columnDbName: ''
    }
});
GeneratorProject.Collections.ColumnsColl = Backbone.Collection.extend({
    model: GeneratorProject.Models.ColumnModel
});
GeneratorProject.Collections.FunctionsList = Backbone.Collection.extend({
    initialize: function () {
        this.add({funcID: 1, funcDBName: "package.func1", funcName: "FUNC1"});
        this.add({funcID: 2, funcDBName: "package.func2", funcName: "FUNC2"});
        this.add({funcID: 3, funcDBName: "package.func3", funcName: "FUNC3"});
        this.add({funcID: 4, funcDBName: "package.func4", funcName: "FUNC4"});
        this.add({funcID: 5, funcDBName: "package.func5", funcName: "FUNC5"});
        this.add({funcID: 6, funcDBName: "package.func6", funcName: "FUNC6"});
        this.add({funcID: 7, funcDBName: "package.func7", funcName: "FUNC7"});
        this.add({funcID: 8, funcDBName: "package.func8", funcName: "FUNC8"});
        this.add({funcID: 9, funcDBName: "package.func9", funcName: "FUNC9"});
        this.add({funcID: 10, funcDBName: "package.func10", funcName: "FUNC10"});
    }
});
/**********************************/
GeneratorProject.App = Marionette.Application.extend({
    regions: {
        body: 'body'
    },
    onStart: function () {
        this.body.show(new GeneratorProject.MainView())
    }
});
GeneratorProject.MainView = Marionette.LayoutView.extend({
    collection: new GeneratorProject.Collections.ColumnsColl(),
    regions: {
        addColumnsRegion: '#add-columns-region',
        chooseMainFuncRegion: '#choose-main-func-region',
        chooseCallbackRegion: '#choose-callback-func-region',
    },
    ui: {
        saveBtn: '#save-btn',
        addColumn: '#add-column-btn',
        formName: '#form-name',
    },
    events: {
        "click @ui.saveBtn": "saveReport",
        "click @ui.addColumn": "addColumnToPage",
        "keyup @ui.formName": "setFormNameInModel"
    },
    initialize: function () {
        this.model = new Backbone.Model();
        this.collection.add(new GeneratorProject.Models.ColumnModel());
    },
    onBeforeRender: function () {
        this.template = Marionette.TemplateCache.get("#generate-form-main-template")
    },
    onShow: function () {
        var funcList = new GeneratorProject.Collections.FunctionsList();
        this.getRegion('addColumnsRegion').show(new GeneratorProject.ShowColumnsView({collection: this.collection}));
        this.getRegion('chooseMainFuncRegion').show(new GeneratorProject.DrawSelect({collection: funcList}));
        this.getRegion('chooseCallbackRegion').show(new GeneratorProject.DrawSelect({collection: funcList}));


    },
    childEvents: {
        'set:func:data': 'onSetFuncData'
    },
    onSetFuncData: function (cv, attr) {
        switch (attr.level) {
            case 1:
                this.model.set("mainFunc", attr.funcDbName);
                break;

            case 2:
                this.model.set("callbackFunc", attr.funcDbName);
                break;
        }
    },
    saveReport: function () {
        this.model.set('columns', this.collection.toJSON());
    },
    addColumnToPage: function () {
        var id = _.max(this.collection.toJSON(), function (c) {
            return c.columnID;
        });
        this.collection.add(new GeneratorProject.Models.ColumnModel({columnID: id.columnID + 1}));
    },
    setFormNameInModel: function () {
        this.model.set('formName', this.ui.formName.val())
    }
});

GeneratorProject.DrawColumnView = Marionette.ItemView.extend({
    model: GeneratorProject.Models.ColumnModel,
    template: _.template(
        "<label for='columnID'>Номер:</label> " +
        "<input id='columnID' class='column' type='number' placeholder='Column ID' value='<%= columnID %>'/>" +
        "<label for='columnName'>Заголовок поля:</label> " +
        "<input id='columnName' class='column' type='text' placeholder='Column name' value='<%= columnName %>'/>" +
        "<label for='columnDbName'>Название поля в БД:</label> " +
        "<input id='columnDbName' class='column' type='text' placeholder='Column db name' value='<%= columnDbName %>'/>" +
        "<button class='button' id='remove-btn'>-</button>"),
    className: "columnRow",
    events: {
        'keyup input': 'saveChangesToModel',
        'click #remove-btn': 'removeModel'
    },
    modelEvents: {
        'change:columnID': 'render'
    },
    removeModel: function () {
        this.model.destroy();
    },
    saveChangesToModel: function (e) {
        this.model.set($(e.target).attr('id'), $(e.target).val())
    }
});
GeneratorProject.ShowColumnsView = Marionette.CollectionView.extend({
    template: _.template(""),
    childView: GeneratorProject.DrawColumnView,
    onAddChild: function () {
        this.__rewriteColumnID();
    },
    onRemoveChild: function () {
        this.__rewriteColumnID();
    },
    __rewriteColumnID: function () {
        var startID = 1;
        var self = this;
        this.collection.each(function (item) {
            self.collection.get(item).set('columnID', startID++)
        });
    }
});
GeneratorProject.DrawOptionForSelect = Marionette.ItemView.extend({
    template: _.template("<%= funcName %>"),
    tagName: "option",
    attributes: function () {
        return {
            funcID: this.model.get("funcID"),
            funcDBName: this.model.get("funcDBName")
        }
    },
    events: {
        "click": "changeValue"
    },
    changeValue: function (e) {
        var attr = {
            level: $(e.target).closest('div').attr('id') === 'choose-main-func-region' ? 1 : 2,
            funcDbName: $(e.target).attr('funcdbname')
        };
        this.triggerMethod("set:func:data", attr)
    }
});
GeneratorProject.DrawSelect = Marionette.CollectionView.extend({
    tagName: 'select',
    template: _.template(""),
    childView: GeneratorProject.DrawOptionForSelect
});
var app = new GeneratorProject.App();
app.start();