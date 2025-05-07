$(function(){
  const $input = $('#input'),
        $prior = $('#prioridad'),
        $pend = $('#tareasPendientes'),
        $comp = $('#tareasCompletadas'),
        KEY = 'tareas';
  let dt;

  // sortable
  $('.lista-sortable').sortable({
    connectWith: '.lista-sortable',
    placeholder: 'tarea-placeholder',
    update: () => { clearTimeout(dt); dt = setTimeout(guardar, 200); }
  }).disableSelection();

  cargar();

  function guardar(){
    const arr = [];
    $('ul li').each(function(){
      arr.push({
        texto: $(this).find('span').text(),
        prioridad: $(this).data('prioridad'),
        completada: $(this).find('.completarChk').is(':checked'),
        hora: $(this).find('span').text().split(' - 📅 ')[1] || null,
      });
    });
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function cargar(){
    const d = localStorage.getItem(KEY);
    if (!d) return;
    JSON.parse(d).forEach(t=>{
      const $li = crear(t.texto, t.prioridad, t.completada);
      (t.completada ? $comp : $pend).append($li);
    });
  }

  // Devuelve orden numérico para cada prioridad
  function orden(prio) {
    return prio === 'alta' ? 1 : prio === 'media' ? 2 : 3;
  }

  // Inserta según prioridad
  function insertarPorPrioridad($li) {
    const pr = $li.data('prioridad');
    let colocada = false;
    $pend.children('li').each(function(){
      const prExist = $(this).data('prioridad');
      if (orden(pr) < orden(prExist)) {
        $(this).before($li);
        colocada = true;
        return false;
      }
    });
    if (!colocada) $pend.append($li);
  }

function crear(txt, prio, done){
  const partes = txt.split(' - 📅 ');
  const baseTxt = partes[0];
  const horaTxt = partes[1] ? ` - 📅 ${partes[1]}` : '';

  const $li = $(`<li class="tarea prioridad-${prio}"></li>`).data('prioridad', prio);
  const $up = $(`<button class="moverBtn" aria-label="Subir">⬆️</button>`);
  const $dn = $(`<button class="moverBtn" aria-label="Bajar">⬇️</button>`);
  const $del = $(`<button class="borrarBtn" aria-label="Eliminar">🗑️</button>`);
  const $chk = $(`<input type="checkbox" class="completarChk">`).prop('checked', done);
  const $reloj = $(`<button class="relojBtn" aria-label="Establecer hora">⏰</button>`);
  const $sp = $(`<span></span>`).text(baseTxt + horaTxt).toggleClass('completada', done);

  $li.append($up, $dn, $chk, $sp, $reloj, $del);
  return $li;
}


  $(document).on('click', '.relojBtn', function () {
  const $li = $(this).closest('li');
  
  // Si ya tiene inputs, no volver a añadir
  if ($li.find('.fechaInput').length) return;

  // Crear selector de fecha
  const $fecha = $('<input type="text" class="fechaInput" placeholder="Fecha">');
  const $hora = $('<input type="time" class="horaInput" step="900">'); // pasos de 15 min
  const $guardar = $('<button class="guardarFechaBtn">Guardar</button>');

  $fecha.datepicker({ dateFormat: "dd-mm-yy", minDate: 0 });

  $li.append($fecha, $hora, $guardar);
});

$(document).on('click', '.guardarFechaBtn', function () {
  const $li = $(this).closest('li');
  const fecha = $li.find('.fechaInput').val();
  const hora = $li.find('.horaInput').val() || 'Sin hora';

  // Si no hay fecha, se toma como "hoy"
  const hoy = new Date();
  const fechaFinal = fecha || `${hoy.getDate()}-${hoy.getMonth()+1}-${hoy.getFullYear()}`;

  let texto = $li.find('span').text();
  texto = texto.replace(/ - 📅.*/, ''); // borra fecha anterior si hay
  $li.find('span').text(`${texto} - 📅 ${fechaFinal} ${hora}`);

  // Limpieza
  $li.find('.fechaInput, .horaInput, .guardarFechaBtn').remove();

  clearTimeout(dt);
  dt = setTimeout(guardar, 200);
});


  function agrega(){
    const t = $input.val().trim(), p = $prior.val();
    if (!t) return;
    const $li = crear(t,p,false,null).hide();
    insertarPorPrioridad($li);
    $li.slideDown(300);
    $input.val(''); clearTimeout(dt); dt=setTimeout(guardar,200);
  }

  $('#añadirTarea').click(agrega);
    $input.keydown(e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        agrega();
      }
    });


  $(document).on('change','.completarChk',function(){
    const $li=$(this).closest('li');
    const target = this.checked ? $comp : $pend;
    $li.find('span').toggleClass('completada', this.checked);
    $li.fadeOut(150,()=> $li.appendTo(target).fadeIn(150));
    clearTimeout(dt); dt=setTimeout(guardar,200);
  });

  $(document).on('click','.moverBtn',function(){
    const $li=$(this).closest('li'), up=$(this).text()==='⬆️';
    const $sib = up ? $li.prev() : $li.next();
    if ($sib.length) moverConAnim($li,()=> up ? $sib.before($li) : $sib.after($li));
  });

  $(document).on('click','.borrarBtn',function(){
    $(this).closest('li').slideUp(300,function(){ $(this).remove(); guardar(); });
  });

  function moverConAnim($li, accion){
    $li.slideUp(200,()=>{ accion(); $li.slideDown(200); });
  }
});