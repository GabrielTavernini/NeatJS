function getClosestPointOnLines(pXy, aXys) {

    var minDist;
    var fTo;
    var fFrom;
    var x;
    var y;
    var i;
    var dist;

    if (aXys.length > 1) {

        for (var n = 1 ; n < aXys.length ; n++) {

            if (aXys[n].l[0] != aXys[n - 1].l[0]) {
                var a = (aXys[n].l[1] - aXys[n - 1].l[1]) / (aXys[n].l[0] - aXys[n - 1].l[0]);
                var b = aXys[n].l[1] - a * aXys[n].l[0];
                dist = Math.abs(a * pXy.x + b - pXy.y) / Math.sqrt(a * a + 1);
            }
            else
                dist = Math.abs(pXy.x - aXys[n].l[0])

            // length^2 of line segment 
            var rl2 = Math.pow(aXys[n].l[1] - aXys[n - 1].l[1], 2) + Math.pow(aXys[n].l[0] - aXys[n - 1].l[0], 2);

            // distance^2 of pt to end line segment
            var ln2 = Math.pow(aXys[n].l[1] - pXy.y, 2) + Math.pow(aXys[n].l[0] - pXy.x, 2);

            // distance^2 of pt to begin line segment
            var lnm12 = Math.pow(aXys[n - 1].l[1] - pXy.y, 2) + Math.pow(aXys[n - 1].l[0] - pXy.x, 2);

            // minimum distance^2 of pt to infinite line
            var dist2 = Math.pow(dist, 2);

            // calculated length^2 of line segment
            var calcrl2 = ln2 - dist2 + lnm12 - dist2;

            // redefine minimum distance to line segment (not infinite line) if necessary
            if (calcrl2 > rl2)
                dist = Math.sqrt(Math.min(ln2, lnm12));

            if ((minDist == null) || (minDist > dist)) {
                if (calcrl2 > rl2) {
                    if (lnm12 < ln2) {
                        fTo = 0;//nearer to previous point
                        fFrom = 1;
                    }
                    else {
                        fFrom = 0;//nearer to current point
                        fTo = 1;
                    }
                }
                else {
                    // perpendicular from point intersects line segment
                    fTo = ((Math.sqrt(lnm12 - dist2)) / Math.sqrt(rl2));
                    fFrom = ((Math.sqrt(ln2 - dist2)) / Math.sqrt(rl2));
                }
                minDist = dist;
                i = n;
            }
        }

        var dx = aXys[i - 1].l[0] - aXys[i].l[0];
        var dy = aXys[i - 1].l[1] - aXys[i].l[1];

        x = aXys[i - 1].l[0] - (dx * fTo);
        y = aXys[i - 1].l[1] - (dy * fTo);

    }

    return { 'x': x, 'y': y, 'i': i, 'fTo': fTo, 'fFrom': fFrom };
}
