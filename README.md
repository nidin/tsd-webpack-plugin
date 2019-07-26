# Description
This libary is a fork from [declaration-bundler-webpack-plugin](https://github.com/smol/declaration-bundler-webpack-plugin) since it seems to be abandonned by the old mantainer with a long time issue that made the old script stop working. I openned a PR fixing the issue in the original code. but since I needed it working for my personal projects, I decided to fork and redistribute as a new npm package, then me and everybody can make use of this Plugin.

This library takes separate declaration asset files generated by the webpack build process and bundles them into one single declaration file.
However it does so by recomposing the separate declarations as if all the classes and interfaces were defined as an __internal module__.
Therefor, using this plugin only makes sense if you expose the classes and interfaces to the global module space yourself.

## Warning
The setup is very simple and was not tested in complex cases. Let me know if there is any issue regading your projects. Feel free to contribute, but keep the Standard Style and Linting alright?

## When to use this
With the sample setup, this plugin will create a file with the entire typescript declaration for your package in only one file. Since the usual `tsc` create one declaration for each file.
# Options: 

- out: the path where the combined declaration file should be saved.
- moduleName: the name of the internal module to generate
- excludedReferences: an array with which references you want to exclude from the final declaration file.

# Requirements:
This plugin was developed as an extention to the [ts-loader](https://github.com/TypeStrong/ts-loader) which - when `declaration` is set to `true` in `tsconfig.json` - generates separate declaration files for each source file. In theory though, it should work with any loader which generates declaration files as output.

# Installing

    yarn add -D tsd-webpack-plugin

or

    npm install tsd-webpack-plugin

Here is an example setup:

    //init.ts
    import Foo = require('./foo');
    import Foo2 = require('./foo2');
    var register:Function = (function()
    {
        some.path['moduleName'] = {
            "Foo": Foo,
            "Foo2" : Foo2,
        }
        return function(){};
    })();
    export = register;
    
    //foo.ts
    export class Foo {
        bar():boolean { return true; }
    }
    
    //foo2.ts
    import Foo = require('./foo');
    export class Foo2 extends Foo {
        bar():boolean { return true; }
    }

Which generates (when using the declaration=true flag for the typescript compiler)

    //init.d.ts
    var register: Function;
    export = register;
    
    //foo.d.ts
    declare class Foo {
        bar():boolean;
    }
    export = Foo;
    
    //foo2.d.ts
    import Foo = require('./foo');
    declare class Foo2 extends Foo{
        bar():boolean;
    }
    export = Foo2;
    
Which with the following webpack.config.js

    var TypescriptDeclarationGenerator = require('tsd-webpack-plugin');
    module.exports = {
        entry: './src/init.ts',
        output: {
            filename: './builds/bundle.js'
        },
        resolve: {
            extensions: ['', '.ts', '.tsx','.webpack.js', '.web.js', '.js']
        },
        module: {
            loaders: [
                { test: /\.ts(x?)$/, loader: 'ts-loader' }
            ]
        },
        watch:true,
        plugins: [
            new TypescriptDeclarationGenerator({
                moduleName:'path.to.moduleName',
                out:'./bundle.d.ts', // The reference here is your output file folder.
            })
        ]
    }

Will be turned into:

    //bundle.d.ts
    declare module path.to.moduleName {
    
        var register: Function;
    
        class Foo {
            bar():boolean;
        }
    
        class Foo2 extends Foo {
            bar():boolean;
        }
    }

With this setup and generated declaration file, other modules that want to use this module can add a reference to the generated bundle.d.ts. 
Then they can access all classes of the module as if they are defined in the global path like with internal typescript modules: 

    ///<reference path="path/to/bundle.d.ts" />
    var foo:path.to.moduleName.Foo = new path.to.moduleName.Foo();

When you finally load bundle.js in the browser, the register function is called automatically, which will make the classes available in the global module path so that other modules can access the classes as they expected from the declaration file.
