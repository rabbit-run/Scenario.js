describe("Scenario.js", function() {
    describe("without cookie persistence", function() {
        function delete_cookie(name) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        }
        it('should be roughly even weighted', function() {
            var res = {
                A: 0,
                B: 0
            };
            var i = 1000;
            while (i--) {
                new Scenario({
                    name: 'Weight Test',
                    track: function(name, opts, cb) {
                        res[opts.Tests]++;
                    }
                })
                    .test({
                        name: 'A'
                    })
                    .test({
                        name: 'B'
                    })
                    .go();
                delete_cookie("Weight Test");
            }
            var diff_ratio = res.A / res.B;
            (diff_ratio > 0.9 && diff_ratio < 1.1).should.equal(true);
        });
    });
    describe("with cookie persistence", function() {
        it('should stick with the chosen test', function() {
            var res = {
                A: 0,
                B: 0
            };
            var i = 1000;
            while (i--) {
                new Scenario({
                    name: 'Cookie Test',
                    track: function(name, opts, cb) {
                        res[opts.Tests]++;
                    }
                })
                    .test({
                        name: 'A'
                    })
                    .test({
                        name: 'B'
                    })
                    .go();
            }
            var abs_diff = Math.abs(res.A - res.B);
            assert.equal(abs_diff, 1000);
        });
    });
});