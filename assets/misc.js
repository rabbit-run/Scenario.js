$(document).ready(function(){
	
	var api = impress();
	api.init();

	$(document).on('click', '#header ul a', function(e){
		e.preventDefault();
		var $this = $(this);
		$('#header a.active').removeClass('active');
		$this.addClass('active');
		
		api.goto($this.data('target')+'-1');

	});

	$(document).on('click', '#next', api.next);
	$(document).on('click', '#prev', api.prev);

	var hashChange = function(){
		var hash = window.location.hash;
		hash = hash.replace('#/', '');
		hash = hash.split('-')[0];
		
		if( $('[data-target="'+hash+'"].active').length==0 ){
			$('#header a.active').removeClass('active');
			$('[data-target="'+hash+'"]').addClass('active');
		}
	};

	hashChange();
	window.onhashchange = hashChange;

});