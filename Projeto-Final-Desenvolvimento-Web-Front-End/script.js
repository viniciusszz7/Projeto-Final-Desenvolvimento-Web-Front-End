// Utilidades de DOM
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const setError = (id, msg) => {
  const el = document.querySelector(`[data-error-for="${id}"]`);
  if (el) el.textContent = msg || "";
};
    
(() => {
  const btn = $(".menu-toggle");
  const menu = $(".menu");
  btn?.addEventListener("click", () => {
    const visible = menu.style.display === "flex";
    menu.style.display = visible ? "none" : "flex";
    btn.setAttribute("aria-expanded", String(!visible));
  });
})();

function requireValue(input, msg) {
  if (!input.value || (input.type === "number" && isNaN(Number(input.value)))) {
    setError(input.id, msg);
    input.focus();
    return false;
  }
  setError(input.id, "");
  return true;
}

(() => {
  const form = $("#form-imc");
  const out = $("#resultado-imc");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const peso = $("#imc-peso");
    const altura = $("#imc-altura");
    if (!requireValue(peso, "Informe um peso válido.")) return;
    if (!requireValue(altura, "Informe uma altura válida.")) return;

    const kg = Number(peso.value);
    const cm = Number(altura.value);
    const m = cm / 100;
    const imc = kg / (m * m);

    let categoria = "";
    if (imc < 18.5) categoria = "Abaixo do peso";
    else if (imc < 25) categoria = "Peso normal";
    else if (imc < 30) categoria = "Sobrepeso";
    else categoria = "Obesidade";

    out.innerHTML = `
      <strong>Resultado:</strong> IMC = ${imc.toFixed(1)} (${categoria})<br>
      <small>Dica: combine treino de força com sono de qualidade.</small>
    `;
  });
})();

(() => {
  const form = $("#form-gasto");
  const out = $("#resultado-gasto");

  const METS = {
    musculacao: 6, 
    corrida: 9.8,
    bike: 7.5,
    hiit: 10
  };

  function ajusteIntensidade(met, intensidade) {
    if (intensidade === "leve") return met * 0.8;
    if (intensidade === "intensa") return met * 1.2;
    return met;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const sexo = $("#g-sexo");
    const peso = $("#g-peso");
    const altura = $("#g-altura");
    const idade = $("#g-idade");
    const atividade = $("#g-atividade");

    if (!requireValue(sexo, "Selecione o sexo.")) return;
    if (!requireValue(peso, "Informe o peso.")) return;
    if (!requireValue(altura, "Informe a altura.")) return;
    if (!requireValue(idade, "Informe a idade.")) return;
    if (!requireValue(atividade, "Selecione o nível de atividade.")) return;

    const kg = Number(peso.value);
    const cm = Number(altura.value);
    const anos = Number(idade.value);
    const fator = Number(atividade.value);

    let bmr = 10 * kg + 6.25 * cm - 5 * anos + (sexo.value === "M" ? 5 : -161);
    const tdee = bmr * fator;

    const tipo = $("#g-atividade-treino").value;
    const dur = Number($("#g-duracao").value);
    const intensidade = $("#g-intensidade").value;
    let calTreino = 0;

    if (tipo && dur) {
      const metBase = METS[tipo] || 6;
      const metAdj = ajusteIntensidade(metBase, intensidade);
      calTreino = metAdj * kg * (dur / 60);
    }

    out.innerHTML = `
      <strong>BMR:</strong> ${Math.round(bmr)} kcal/dia<br>
      <strong>TDEE (estimado):</strong> ${Math.round(tdee)} kcal/dia<br>
      <strong>Calorias do treino:</strong> ${Math.round(calTreino)} kcal<br>
      <small>Use o TDEE para ajustar seu objetivo (superávit para ganho, déficit para perda).</small>
    `;
  });
})();

(() => {
  const form = $("#form-treino");
  const out = $("#resultado-treino");

  const baseExercicios = {
    hipertrofia: {
      completa: ["Supino reto", "Remada curvada", "Agachamento livre", "Desenvolvimento militar", "Levantamento terra", "Rosca direta", "Tríceps testa"],
      basica: ["Supino com halteres", "Remada unilateral", "Agachamento goblet", "Desenvolvimento com halteres", "Levantamento terra romeno", "Rosca alternada", "Tríceps francês"],
      corpo: ["Flexões", "Remada invertida", "Agachamento livre", "Pike push-up", "Pontes", "Prancha", "Mergulhos em banco"]
    },
    emagrecimento: {
      completa: ["Circuito máquinas", "Bike 20'", "Supino reto", "Agachamento livre", "Burpees"],
      basica: ["Circuito halteres", "Cordas 15'", "Kettlebell swings", "Agachamento goblet", "Mountain climbers"],
      corpo: ["HIIT corpo livre", "Corrida leve 20'", "Agachamentos", "Polichinelos", "Prancha"]
    },
    resistencia: {
      completa: ["Corrida intervalada", "Remo ergométrico", "Agachamento leve", "Levantamento terra leve", "Bike 30'"],
      basica: ["Corrida + halteres", "Bike 25'", "Agachamento goblet", "Flexões", "Prancha lateral"],
      corpo: ["Corrida", "Burpees", "Agachamentos", "Flexões", "Prancha"]
    },
    saude: {
      completa: ["Cadeira extensora", "Puxada frontal", "Leg press", "Supino máquina", "Caminhada 20'"],
      basica: ["Halteres leves", "Elásticos puxada", "Agachamento goblet", "Caminhada 20'", "Prancha"],
      corpo: ["Caminhada", "Agachamentos", "Prancha", "Flexões inclinadas", "Bird-dog"]
    }
  };

  function montarSplit(dias) {
    if (dias <= 3) return ["Full body A", "Full body B", "Cardio/CORE"];
    if (dias === 4) return ["Superior A", "Inferior A", "Superior B", "Inferior B"];
    if (dias === 5) return ["Push", "Pull", "Legs", "Cardio/CORE", "Full body"];
    return ["Push", "Pull", "Legs", "Cardio/CORE", "Upper", "Lower"];
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const objetivo = $("#t-objetivo");
    const nivel = $("#t-nivel");
    const dias = $("#t-dias");
    const equip = $("#t-equip");

    if (!requireValue(objetivo, "Selecione o objetivo.")) return;
    if (!requireValue(nivel, "Selecione o nível.")) return;
    if (!requireValue(dias, "Informe os dias por semana.")) return;
    if (!requireValue(equip, "Selecione os equipamentos.")) return;

    const d = Math.max(2, Math.min(6, Number(dias.value)));
    const split = montarSplit(d);
    const lista = baseExercicios[objetivo.value][equip.value];

    const multSeries = nivel.value === "iniciante" ? 3 : nivel.value === "intermediario" ? 4 : 5;
    const repsFaixa = nivel.value === "iniciante" ? "10-12" : nivel.value === "intermediario" ? "8-12" : "6-10";
    const descanso = nivel.value === "iniciante" ? 60 : nivel.value === "intermediario" ? 75 : 90;

    let html = `<strong>Plano (${d} dias):</strong><br>`;
    split.forEach((diaNome, idx) => {
      const bloco = lista.slice(0, 5).map((ex) => `• ${ex} — ${multSeries}x ${repsFaixa} (descanso ${descanso}s)`).join("<br>");
      html += `
        <div class="plano-dia">
          <h4>Dia ${idx + 1}: ${diaNome}</h4>
          ${bloco}
        </div>
      `;
    });

    html += `<small>Dica: priorize técnica e consistência. Ajuste carga progressivamente.</small>`;
    out.innerHTML = html;
  });
})();

(() => {
  const form = $("#form-exercicio");
  const lista = $("#lista-exercicios");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#ex-nome");
    const series = $("#ex-series");
    const reps = $("#ex-reps");
    const descanso = $("#ex-descanso");

    if (!requireValue(nome, "Informe o nome.")) return;
    if (!requireValue(series, "Informe as séries.")) return;
    if (!requireValue(reps, "Informe as repetições.")) return;
    if (!requireValue(descanso, "Informe o descanso.")) return;

    const li = document.createElement("li");
    li.className = "item-exercicio";
    li.innerHTML = `
      <div>
        <strong>${nome.value}</strong>
        <span>— ${series.value}x ${reps.value} (descanso ${descanso.value}s)</span>
      </div>
      <button type="button" class="btn btn-secondary btn-remover">Remover</button>
    `;
    lista.appendChild(li);

    form.reset();
    $$("small.error", form).forEach(s => s.textContent = "");
  });

  lista.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remover");
    if (btn) {
      const li = btn.closest("li");
      li?.classList.add("fade-out");
      setTimeout(() => li?.remove(), 180);
    }
  });
})();

(() => {
  const form = $("#form-contato");
  const out = $("#resultado-contato");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#c-nome");
    const email = $("#c-email");
    const mensagem = $("#c-mensagem");
    const termos = $("#c-termos");

    const okNome = requireValue(nome, "Informe seu nome.");
    const okEmail = requireValue(email, "Informe um email válido.");
    const okMsg = requireValue(mensagem, "Escreva ao menos 10 caracteres.");
    if (!termos.checked) { setError("c-termos", "Você precisa aceitar os termos."); }
    else setError("c-termos", "");

    if (!(okNome && okEmail && okMsg && termos.checked)) return;

    out.innerHTML = `<strong>Obrigado, ${nome.value}!</strong> Responderemos em breve no seu email.`;
    form.reset();
    $$("small.error", form).forEach(s => s.textContent = "");
  });
})();

const style = document.createElement("style");
style.textContent = `
  .item-exercicio { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px; border-bottom: 1px solid #2e3453; }
  .fade-out { opacity: 0; transform: translateX(-6px); transition: all 0.18s ease; }
`;
document.head.appendChild(style);