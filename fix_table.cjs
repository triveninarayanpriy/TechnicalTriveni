const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectLayoutV2.astro', 'utf8');

c = c.replace(
  '<table class="bom v2-bom" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">',
  '<div class="table-responsive"><table class="bom v2-bom" style="width: 100%; border-collapse: collapse; font-size: 0.9rem; min-width: 500px;">'
);
c = c.replace(
  '                </table>\n              </div>\n            ))}',
  '                </table>\n              </div></div>\n            ))}'
);

c = c.replace(
  '<table class="pins v2-pins">',
  '<div class="table-responsive"><table class="pins v2-pins" style="min-width: 450px;">'
);
c = c.replace(
  '                    </tbody>\n                  </table>\n                </div>\n              ))}',
  '                    </tbody>\n                  </table>\n                </div></div>\n              ))}'
);

const css = `
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }
`;
c = c.replace('/* ===== Responsive Logic ===== */', css + '\n  /* ===== Responsive Logic ===== */');

fs.writeFileSync('src/components/ProjectLayoutV2.astro', c);
