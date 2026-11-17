/* Compatibility adapter. Only route/section messages cross the frame boundary. */
(() => {
  const tabs = new Set(["live", "perf", "map", "discover", "coach", "pro"]);
  const subTabs = new Set(["social", "routes", "events", "services", "top"]);
  let needsFocus = false;
  let request = { tab: "coach", section: "", lesson: "", sub: "" };
  function notify() {
    parent.postMessage(
      {
        type: "newridebis-ready",
        authenticated: !!CURRENT_USER,
        voiceActive: !!S.realtimeActive,
        tab: S.tab,
      },
      location.origin,
    );
  }
  function showLogin() {
    if (S.realtimeActive || S.realtimeConnecting) return;
    document.getElementById("auth").classList.remove("hidden");
    document.getElementById("auth-title").textContent =
      "Retrouvez votre compte NewRidebis";
    const message = document.getElementById("auth-error");
    if (message) {
      message.textContent =
        "Connectez-vous pour utiliser ALI et enregistrer vos données partagées.";
      message.style.display = "block";
    }
  }
  window.newrideV2Preview = function () {
    S.obSport = "equestre";
    PROFILES.equestre = PROFILES.equestre || {
      partnerName: "Votre cheval",
      level: 1,
      frequency: "1-2x",
    };
    launchApp();
    applyRequest();
  };
  function focusSection() {
    if (!needsFocus || request.tab !== "coach" || S.tab !== "coach") return;
    if (request.lesson) {
      const cat = LESSON_CATEGORIES.find((c) =>
        c.topics.includes(request.lesson),
      );
      if (cat && !S.lessonCategoryOpen?.[cat.name]) {
        S.lessonCategoryOpen = S.lessonCategoryOpen || {};
        S.lessonCategoryOpen[cat.name] = true;
        originalRender();
      }
      const button = document.getElementById(
        "lesson-btn-" + request.lesson.replace(/[^a-zA-Z0-9]/g, ""),
      );
      if (button) {
        needsFocus = false;
        button.classList.add("v2-focus");
        button.scrollIntoView({ block: "center", behavior: "instant" });
      }
    } else if (request.section === "voice") {
      const button = [...document.querySelectorAll("button")].find((b) =>
        (b.getAttribute("onclick") || "").includes("startRealtimeConversation"),
      );
      if (button) {
        needsFocus = false;
        button.classList.add("v2-focus");
        button.scrollIntoView({ block: "center", behavior: "instant" });
      }
    } else if (request.section === "lessons") {
      const heading = [...document.querySelectorAll("div")].find(
        (el) =>
          el.children.length === 0 &&
          /Leçons|leçons/.test(el.textContent || ""),
      );
      heading?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  const originalRender = render;
  render = function () {
    originalRender();
    focusSection();
    const content = document.getElementById("content");
    content.classList.toggle("v2-coach-layout", S.tab === "coach");
    document.body.classList.toggle("v2-modern-coach", S.tab === "coach");
    if (S.tab === "coach") {
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode()))
        node.textContent = node.textContent.replace(
          /[\p{Extended_Pictographic}\uFE0F]/gu,
          "",
        );
      const voiceTitle = [...content.querySelectorAll("div")].find(
        (el) =>
          el.children.length === 0 && el.textContent === "Parler avec le coach",
      );
      if (voiceTitle)
        voiceTitle.textContent = "PRENEZ LE TEMPS. PARLONS ÉQUITATION.";
    }

    for (const card of content.querySelectorAll(":scope > .card-dark")) {
      if (card.querySelector("[onclick*=toggleAliStory]"))
        card.classList.add("v2-story");
      if (
        card.querySelector("[onclick*=startRealtimeConversation]") ||
        card.querySelector("[onclick*=stopRealtimeConversation]")
      )
        card.classList.add("v2-voice-card");
      if (card.textContent.includes("Leçons du coach"))
        card.classList.add("v2-lessons-card");
      if (card.querySelector("#coach-wrap"))
        card.classList.add("v2-context-card");
    }
    const login = document.querySelector("#hdr-inner button[title]");
    if (login && !CURRENT_USER) login.title = "Se connecter à NewRidebis";
    notify();
  };
  const positions = new Map();
  const drafts = new Map();
  let previousTab = null;
  function applyRequest() {
    if (!S.sport || document.getElementById("app").style.display === "none")
      return;
    const content = document.getElementById("content");
    if (previousTab && previousTab !== request.tab) {
      positions.set(previousTab, content.scrollTop);
      drafts.set(
        previousTab,
        [...content.querySelectorAll("textarea,input[type=text]")]
          .filter((el) => el.id && !/auth|password|email/i.test(el.id))
          .map((el) => [el.id, el.value]),
      );
    }
    if (subTabs.has(request.sub)) S.discoverSub = request.sub;
    go(request.tab);
    const restoring = previousTab !== request.tab;
    previousTab = request.tab;
    requestAnimationFrame(() => {
      if (restoring && !request.section && !request.lesson) {
        content.scrollTop = positions.get(request.tab) || 0;
        for (const [id, value] of drafts.get(request.tab) || []) {
          const el = document.getElementById(id);
          if (el) el.value = value;
        }
      }
    });
  }
  addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== parent ||
      event.data?.type !== "newride-v2-route"
    )
      return;
    const data = event.data;
    if (data.action === "login") {
      showLogin();
      return;
    }
    if (!tabs.has(data.tab)) return;
    needsFocus = true;
    request = {
      tab: data.tab,
      section:
        typeof data.section === "string" ? data.section.slice(0, 30) : "",
      lesson: typeof data.lesson === "string" ? data.lesson.slice(0, 240) : "",
      sub: subTabs.has(data.sub) ? data.sub : "",
    };
    applyRequest();
  });
  const startVoice = startRealtimeConversation;
  startRealtimeConversation = function () {
    if (!CURRENT_USER) return showLogin();
    return startVoice();
  };
  const startLesson = startLessonConversation;
  startLessonConversation = function (topic) {
    if (!CURRENT_USER) return showLogin();
    return startLesson(topic);
  };
  const afterLogin = afterAuth;
  afterAuth = async function () {
    await afterLogin();
    if (PROFILES.equestre) {
      S.obSport = "equestre";
      launchApp();
      applyRequest();
    }
    notify();
  };
  notify();
})();
// A lesson title is editorial, never evidence for a number or causal conclusion.
const v2EvidenceGuard =
  "\nNe traite jamais un titre de leçon comme une preuve. Ne donne pas de pourcentage, de classement de causes, de diagnostic ou de promesse d’efficacité sans une référence établie et pertinente. Distingue les résultats d’études, les hypothèses et le ressenti déclaré. Aucune compétence acquise ne se déduit d’une conversation ni de deux appels d’outil. Un capteur de casque n’est pas un capteur placé sur le cheval. Indique les limites et demande une observation qualifiée lorsque nécessaire.";
const v2OriginalLessonInstructions = buildLessonRealtimeInstructions;
buildLessonRealtimeInstructions = function (topic) {
  return v2OriginalLessonInstructions(topic) + v2EvidenceGuard;
};
const v2OriginalRealtimeInstructions = buildRealtimeInstructions;
buildRealtimeInstructions = function () {
  return v2OriginalRealtimeInstructions() + v2EvidenceGuard;
};
