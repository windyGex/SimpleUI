YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Simple.Attribute",
        "Simple.AutoComplete",
        "Simple.Button",
        "Simple.ButtonGroup",
        "Simple.ComboButton",
        "Simple.ContextMenu",
        "Simple.DatePicker",
        "Simple.DatePickerBase",
        "Simple.Dialog",
        "Simple.Drag",
        "Simple.DropDownButton",
        "Simple.EventTarget",
        "Simple.Menu",
        "Simple.MenuItem",
        "Simple.Modal",
        "Simple.Pagination",
        "Simple.Resize",
        "Simple.Selectable",
        "Simple.Tip",
        "Simple.TipBase",
        "Simple.Transition",
        "Simple.Widget"
    ],
    "modules": [
        "attribute",
        "declare",
        "event",
        "transition",
        "ui.auto-complete",
        "ui.button",
        "ui.button-group",
        "ui.date-picker",
        "ui.dialog",
        "ui.drag",
        "ui.menu",
        "ui.modal",
        "ui.pagination",
        "ui.resize",
        "ui.selectable",
        "ui.tool-tip",
        "widget"
    ],
    "allModules": [
        {
            "displayName": "attribute",
            "name": "attribute",
            "description": "SimpleUI的属性类，该类被设计为用于混合的基类，用于为类的属性提供get，set支持。\n\n    require(['attribute'],function(Attribute){\n    \n        var Animal = Simple.declare('Animal',Attribute,{\n            \n            _getterId:function(id){\n                if(id){\n                    return id;\n                }else{\n                    return 'animal';\n                }\n            },\n            \n            _setterId:function(id){\n            \n                return id+'_animal';\n            }\n        });\n        \n        var animal = new Animal();\n        \n        animal.get('id');//will console animal\n        animal.id //will console undefined\n        animal.set('id','test');//the id is test_animal\n        \n    });"
        },
        {
            "displayName": "declare",
            "name": "declare",
            "description": "定义一个基础类，并且遍历指定的对象，拷贝到类的原型链上，并且调用原型链上的init的方法进行初始化。\n如果指定父类，则该类会继承于这个父类，并且可以使用inherit来便捷调用父级方法.\n\n    Simple.declare('Animal',{\n        getName:function(){\n            return 'animal';\n        }\n    });\n    Simple.declare('Bird',Simple.Animal,{\n        getName:function(){\n            var superResult = this.inherit(arguments);\n            return superResult + ' bird';\n        }\n    });\n    console.log(new Simple.Bird().getName());//will console animal bird"
        },
        {
            "displayName": "event",
            "name": "event",
            "description": "为SimpleUI提供基本的事件支持，简化事件操作流程，提升响应速度，\n并且针对SimpleUI的组件特性加入了对node节点的disabled嗅探\n\n * 当该节点的的样式类中包含`disable`，则不会对该操作进行响应\n * 支持二级命名空间事件命名\n * 支持面向切面的事件编程,该类被设计为用于继承的基类。"
        },
        {
            "displayName": "transition",
            "name": "transition",
            "description": "为SimpleUI的组件提供缓动效果，此效果使用CSS3的transition属性实现，目前包含slide,drop,fade,sacle等四种效果。 在低级浏览器下只有机械式的显示隐藏"
        },
        {
            "displayName": "ui.auto-complete",
            "name": "ui.auto-complete",
            "description": "自动完成组件，自动完成组件继承与widget，拥有和widget一样的生命周期。\n同样，AutoComplete被设计为可扩展的，很方面可以基于此定制特定的自动完成组件\n\n\trequire(['ui/auto-complete'],function(AutoComplete){\n\t\tnew AutoComplete({\n\t\t\tnode:'#test',\n\t\t\tsource:['java','javascript']\n\t\t});\n\t\t//或者\n\t\t$('#test').autocomplete({\n\t\t\tsource:['java','javascript']\n\t\t});\n\n\t});"
        },
        {
            "displayName": "ui.button",
            "name": "ui.button",
            "description": "Button按钮组件，提供可定制的按钮\n\n\trequire(['ui/button'],function(Button){\n\t\tnew Button({\n\t\t\tlabel:'button',\n\t\t\thandle:function(){\n              alert('click');\n         }\n\t\t});\n\t});"
        },
        {
            "displayName": "ui.button-group",
            "name": "ui.button-group",
            "description": "Button组按钮组件，提供一系列可定制的按钮\n\n\trequire(['ui/button-group'],function(ButtonGroup){\n\t\tnew ButtonGroup({\n\t\t\titems:[]\n\t\t});\n\t});"
        },
        {
            "displayName": "ui.date-picker",
            "name": "ui.date-picker",
            "description": "日期选择基础类,提供最基本的日历渲染功能"
        },
        {
            "displayName": "ui.dialog",
            "name": "ui.dialog",
            "description": "对话框组件，提供可定制的遮罩对话框，支持多窗口,拖动等特性"
        },
        {
            "displayName": "ui.drag",
            "name": "ui.drag",
            "description": "Drag模块为web应用增加类似桌面应用程序般的功能和易用性。Drag本身可以让一个Dom元素可移动，\n并且可以设置拖动手柄来启用拖动，也可以设置拖动的范围。Drag模块本身包括了一个放置模块，通过抛出的事件使得交互变得更加简单\n\n    require(['ui/drag'],function(Drag){\n        new Drag({\n            node:'#drag-dom'\n        });\n    });"
        },
        {
            "displayName": "ui.menu",
            "name": "ui.menu",
            "description": "Menu用于模拟点击桌面图标出现的菜单条目，继承于Widget类，同样Menu可以选择延迟渲染还是声明即渲染.\n\n    require(['ui/menu'],function(){\n        new Menu({\n            items:[{label:'simple-menu'}]\n        });\n    });"
        },
        {
            "displayName": "ui.modal",
            "name": "ui.modal",
            "description": "渲染一个遮罩遮住某个dom元素"
        },
        {
            "displayName": "ui.pagination",
            "name": "ui.pagination",
            "description": "提供分页功能的组件"
        },
        {
            "displayName": "ui.resize",
            "name": "ui.resize",
            "description": "让一个dom元素可以被重设尺寸。\n    \n    require(['ui/resize'],function(){\n        $('#test').resizable();\n    });"
        },
        {
            "displayName": "ui.selectable",
            "name": "ui.selectable",
            "description": "让一个dom元素可以被框选\n    \n    require(['ui/selectable'],function(){\n        $('#test').selectable({\n            selectNode:'li'\n        });\n    });"
        },
        {
            "displayName": "ui.tool-tip",
            "name": "ui.tool-tip",
            "description": "提示功能的基类,该类可以直接被实例化，通常用于新功能提示等"
        },
        {
            "displayName": "widget",
            "name": "widget",
            "description": "继承自Attribute类，为所有的SimpleUI的UI组件提供基类支持，拥有`init`,`render`,`destroy`生命周期. 这个基类提供了很多可以复写的方法，可以方便的实现自定义行为，从而降低工作量.\n>该类被设计为用于继承的基类，通常不会被直接实例化"
        }
    ]
} };
});