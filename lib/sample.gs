magpie = include.magpie;
include.$db.set(ScriptDb.getMyDb());

function onOpen() {  
  magpie.onOpen();
};

function update() {
  magpie.update('26d1b0f44579cca74e182914a4cb33dceba9576');
}

function chart() {
  magpie.viewChartPanel();
}

function reset() {
  magpie.reset();
}



