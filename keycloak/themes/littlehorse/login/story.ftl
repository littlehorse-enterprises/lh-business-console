<section class="story" aria-labelledby="story-title">
  <div class="processMatrix" aria-hidden="true">
    <div class="matrixTilt">
      <#list [{"id":"far", "width":101, "height":94, "size":30, "class":"matrixFar"}, {"id":"middle", "width":137, "height":121, "size":46, "class":"matrixMiddle"}, {"id":"near", "width":183, "height":150, "size":68, "class":"matrixNear"}] as plane>
        <div class="matrixMotion ${plane.class}">
          <svg class="matrixTexture" width="100%" height="100%" fill="none" focusable="false">
            <defs>
              <pattern id="business-matrix-${plane.id}" width="${plane.width?c}" height="${plane.height?c}" patternUnits="userSpaceOnUse">
                <g class="matrixEdges"><path d="M${plane.size?c} ${(plane.size / 3)?c}H${plane.width?c}"/><path d="M${(plane.size / 2)?c} ${(plane.size * 2 / 3)?c}V${plane.height?c}"/></g>
                <g transform="scale(${(plane.size / 60)?c})">
                  <rect x="0.5" y="0.5" width="59" height="39" rx="7" fill="var(--card)" stroke="var(--muted-foreground)" stroke-width="0.8"/>
                  <rect x="9" y="11" width="15" height="17" rx="4" fill="var(--primary)" fill-opacity="0.12" stroke="var(--amber-600)" stroke-opacity="0.7" stroke-width="0.7"/>
                  <path d="m13 19 3 3 5-6" stroke="var(--amber-600)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M31 18h16M31 24h10" stroke="var(--muted-foreground)" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="49" cy="11" r="2.5" fill="var(--primary)"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#business-matrix-${plane.id})"/>
          </svg>
        </div>
      </#list>
    </div>
  </div>
  <div class="brand"><img src="${url.resourcesPath}/img/logo.svg" class="themeHorse" alt="" width="42" height="37"><span>LittleHorse</span></div>
  <div class="storyBody">
    <p class="eyebrow">BUSINESS CONSOLE</p>
    <h1 id="story-title">Keep work<br><span>moving.</span></h1>
    <div class="illustration" aria-hidden="true">
      <svg class="connections" viewBox="0 0 500 260" fill="none"><path d="M40 178H105Q125 178 125 158V83Q125 63 145 63H250"/><path d="M250 63H355Q375 63 375 83V178Q375 198 395 198H465"/><path d="M250 63V233" stroke-dasharray="4 7"/><circle cx="40" cy="178" r="4"/><circle cx="465" cy="198" r="4"/><circle cx="250" cy="233" r="4"/></svg>
      <div class="horseOrbit"><div class="horseDisc"><img src="${url.resourcesPath}/img/logo.svg" alt="" width="100" height="86"></div></div>
      <div class="workflowNode reviewNode">
        <span class="previewStatus"></span>
        <div class="previewHeader"><span class="previewIcon">✓</span><span class="previewTitles"><span class="previewTitle">User tasks</span><span class="heroSkeleton previewSubtitleLine"></span></span></div>
        <div class="previewMetrics"><span class="heroSkeleton metricLine"></span><span class="heroSkeleton metricLine"></span><span class="heroSkeleton metricLine"></span></div>
      </div>
      <div class="workflowNode completeNode"><span class="previewIcon usersIcon">✓</span><span class="previewTitles"><span class="previewTitle">Active Users</span><span class="heroSkeleton previewCount"></span></span></div>
    </div>
  </div>
</section>
