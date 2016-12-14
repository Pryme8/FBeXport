//BJX file format... Author : Andrew V Butt Sr.  Pryme8@gmail.com;
//Do what you want this this!

BJX = function(args){
	this._target = args.target || null;
	this.currentWindow = document.getElementById('start'); //Store which step we are at.
		
	if((this._target) && this._target['files'][0]){this._init();} //Check the target input and that it has a file, if so then start things, if not return false.
	else{return false;}
	
	return this;
};

BJX.prototype._init = function(){
	var file = this._target['files'][0];

	var vEx = ["fbx", "FBX", "bjx", "BJX"]; //Valid Extensions, no reason to do regex here...
	var fChain = file.name.split(".");

if (fChain.length > 1) {
   var fEx = fChain[fChain.length-1];
   var flag = false;
   for(var i = 0; i < vEx.length; i++){
	   if(vEx[i]==fEx){flag=true; i=vEx.length}; //if Match kick out of loop.
   }
   
   if(!flag){return false;}else{
		   this.file = file;
		   this._parseURI();
   }//No valid match;
   
}else { return false; } //No file extension.

};


BJX.prototype._parseURI = function(){
	BJX.changeWindow('loading', this);
	this.reader = new FileReader();
	var self = this;
		this.reader.onload = function(progressEvent){
   			var response = this.result;
			console.log(response);
			response = (response.replace(/^;(.*)/gm, '')).split(/\r?\n/);
			self.response = response;
			self.data = new BJX.DATA();
			
			
			self._parseRun(0, []);
		
		}
		
	this.reader.readAsText(this.file);
};


BJX.prototype._parseRun = function(i, chain){
	if(i<this.response.length){
		var ln = this.response[i];
		if(ln != ""){
			if ( ln.match(/(\})/) ) {
				//Close Chain
				chain.pop();
			}
			
			if ( ln.match(/(\{)/) ) {
				//ln = ln.split(/,/g);
  				// This is a Object, add to Chain
				
				var kVal = (ln.replace(/(:.*\{)/g, '')).replace(/\s/g, '');
				chain.push(kVal);
			} else {
  				var kVal = /(.*:\s)(.*)/i;
				kVal = kVal.exec(ln);
				if(kVal){
				var key = kVal[1].replace(/\s|:/g, ''); var val = kVal[2].replace(/\s/g, '')||"";
				console.log("KEY:"+key, "VALUE:"+val);
				if(key == "P"){
					var subKey = val.split(/,/g);
					console.log(subKey);
					var type = subKey[1];
					key = subKey[0];
					val = subKey[subKey.length-1];					
				}
				
				var o = (eval("this.data"+(JSON.stringify(chain)).replace(/,/g, '][')));
				o[key] = val;
				}
			} 
			this._checkChain(chain);
			//console.log(this.data);
		}
		
		var self = this;
		i++;
		setTimeout(function(){self._parseRun(i, chain)},0);
	}else{		
		
		
		console.log(this.data);
		this._buildDom();
	}
};


BJX.prototype._buildDom = function(){
	var t = document.getElementById('info-pane');
	if(typeof this.data['FBXHeaderExtension'] == 'object'){
		var dom = this.createDomBlock(this.data['FBXHeaderExtension'], 'FBXHeaderExtension');
		t.appendChild(dom);
	}
	
	if(typeof this.data['GlobalSettings'] == 'object'){
		var dom = this.createDomBlock(this.data['GlobalSettings'], 'GlobalSettings');
		t.appendChild(dom);
	}
	
	if(typeof this.data['Documents'] == 'object'){
		var dom = this.createDomBlock(this.data['Documents'], 'Documents');
		t.appendChild(dom);
	}
	
	if(typeof this.data['References'] == 'object'){
		var dom = this.createDomBlock(this.data['References'], 'References');
		t.appendChild(dom);
	}
	
	
	if(typeof this.data['Definitions'] == 'object'){
		var dom = this.createDomBlock(this.data['Definitions'], 'Definitions');
		t.appendChild(dom);
	}
	
	if(typeof this.data['Objects'] == 'object'){
		var dom = this.createDomBlock(this.data['Objects'], 'Objects');
		t.appendChild(dom);
	}
	
	if(typeof this.data['Connections'] == 'object'){
		var dom = this.createDomBlock(this.data['Connections'], 'Connections');
		t.appendChild(dom);
	}
	
	
	
	BJX.changeWindow('edit', this);
};


BJX.prototype.createDomBlock = function(o, dom){
	console.log(o);
	if(typeof dom == 'string'){
		var d = document.createElement('div');	
		d.setAttribute('class', 'item-block');
		d.setAttribute('id', dom);
		d.innerHTML = "<div class='item-head'>"+dom+"</div>";
		dom = d;
	}
	var keys = Object.keys(o);
	for(var i=0; i<keys.length; i++){
		if(typeof o[keys[i]] == 'object'){
			var it = this.createDomBlock(o[keys[i]], keys[i]);
			dom.appendChild(it);	
		}else{
			var it = document.createElement('div');
			it.setAttribute('class', 'item');
			it.innerHTML = "<span class='tag'>"+keys[i]+"</span><span class='value'>"+o[keys[i]]+"</span>";
			dom.appendChild(it);	
		}
	}
	
	return dom;
};




BJX.DATA = function(){	
	return this;
};


BJX.prototype._checkChain = function(chain){
	for(var i = 0; i<chain.length; i++){
		var o = (eval("this.data"+(JSON.stringify(chain)).replace(/,/g, '][')));
		if(typeof o != 'object'){
			eval("this.data"+(JSON.stringify(chain)).replace(/,/g, '][')+" = {};");
		}
	}
}





BJX.findKey = function(key, o){
	 for (var i in o) {
        if (o[i] !== null && typeof(o[i])=="object" && Object.keys(o[i])) {
			console.log(Object.keys(o[i]));
            BJX.findKey(key, o[i]);
        }
    }
};






BJX.changeWindow = function(t, parent){
	t = document.getElementById(t);
	//This is all aesthetic...
	function fadeIn(o){
		if(o<1){
			o = Math.min(o+0.1, 1);			
			t.style['opacity'] = o;			
			setTimeout(function(){fadeIn(o);},1000/30);			
		}else{
			parent.currentWindow = t;
		}
	}	
	
	function fadeOut(o){
		if(o>0){
			o = Math.max(o-0.1, 0);			
			parent.currentWindow.style['opacity'] = o;			
			setTimeout(function(){fadeOut(o);},1000/30);
			
		}else{
			parent.currentWindow.setAttribute('class', 'window');
			t.setAttribute('class', 'window active');
			fadeIn(0);
		}
	};
		
	fadeOut(1);	
};
















