(function (w, d) {

    "use strict";

    var Namespace = "Scenario";
    var COOKIE_PERSISTENT_DAYS = 90;

    var Tester = Tester || function (scenarioOpts) {

        scenarioOpts.track = scenarioOpts.track || function(text, props, cb){
            if( typeof mixpanel !== "undefined" ){
                return mixpanel.track(text, props, cb);
            }
        };

        var self = this;
        var utils;

        /**
         * Keeps track of internal data
         * @type {Object}
         */
        self.cache = {
            ranTests: {},
            weights: {},
            totalWeights: 0
        };

        /**
         * A hash of tests to run
         * @type {Object}
         */
        self.tests = {};

        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        }

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') { c = c.substring(1); }
                if (c.indexOf(name) !== -1) { return c.substring(name.length, c.length); }
            }
            return "";
        }

        /**
         * Helper functions
         * @type {Object}
         */
        utils = {

            track: scenarioOpts.track,
            toSlug: function (s) {
                return s.toLowerCase().replace(/-+/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            },
            chooseTest: function() {
                var abtest_name = scenarioOpts.name,
                    previous_assigned_test = this.previousAssignedTest(),
                    chosen_test;
                if (previous_assigned_test) {
                    chosen_test = previous_assigned_test;
                } else {
                    chosen_test = this.chooseWeightedItem();
                    this.persistentChosenTest(chosen_test);
                }
                return chosen_test;
            },
            persistentChosenTest: function(chosen_test) {
                if (typeof chosen_test !== "undefined") {
                    setCookie(scenarioOpts.name, chosen_test, COOKIE_PERSISTENT_DAYS);
                }
            },
            previousAssignedTest: function() {
                return getCookie(scenarioOpts.name);
            },
            chooseWeightedItem: function(){
                var toChoose = [],
                    i;
                for(i in self.cache.weights){
                    var _weight = self.cache.weights[i];
                    while(_weight--){
                        toChoose.push(parseInt(i, 10));
                    }
                }
                return toChoose[Math.floor(Math.random() * toChoose.length)];
            }
        };


        self.test = function (opts) {

            opts.weight = opts.weight || 1;

            var index = self.tests[scenarioOpts.name].length;

            self.tests[scenarioOpts.name].push({
                name: opts.name,
                callback: opts.callback,
                weight: opts.weight,
                className: opts.className || utils.toSlug(opts.name)
            });

            self.cache.weights[index] = opts.weight;
            self.cache.totalWeights += opts.weight;

            return this;
        };

        self.go = function() {

            var chosenTestIndex = utils.chooseTest();
            var test = self.tests[scenarioOpts.name][chosenTestIndex];

            d.body.className += " "+test.className;

            self.cache.ranTests[scenarioOpts.name] = test.name;

            utils.track(scenarioOpts.name+" Start", {
                Tests: test.name
            });
            if (typeof test.callback === "function") {
                test.callback.call(null, {
                    name: test.name,
                    slug: test.className,
                    weight: test.weight+'/'+self.cache.totalWeights,
                    odds: Math.floor( (test.weight/self.cache.totalWeights) * 100)
                });
            }
            return this;
        };

        self.complete = function(fn){
            return utils.track(scenarioOpts.name+" Finish", null, fn);
        };

        self.tests[scenarioOpts.name] = self.tests[scenarioOpts.name] || [];
    };

    // Assign to the global namespace
    this[Namespace] = Tester;

}).call(this, window, document);
