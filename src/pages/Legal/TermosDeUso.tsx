import { usePageTitle } from "../../lib/hooks/usePageTitle";
import '../_styles/legal.css';

export default function TermosDeUso() {
    usePageTitle("Termos de Uso");

    return (
        <>
            <div className="paddingHeader"></div>
            <section className="vertical conteudo gap30 legal">
                <div>
                    <h1>Termos de Uso</h1>
                    <p className="legalUpdated">
                        Última atualização: 08 de abril de 2026
                    </p>
                </div>

                <section>
                    <h2>1. Aceitação</h2>
                    <p>
                        Este Termo de Uso estabelece as condições para acesso e
                        utilização do sistema web desenvolvido por alunos do
                        Instituto Federal de Educação, Ciência e Tecnologia de
                        São Paulo (IFSP) — Câmpus Caraguatatuba, destinado ao
                        Parque Natural Municipal Juqueriquerê (PNMJ), localizado
                        no município de Caraguatatuba, no estado de São Paulo.
                    </p>

                    <p>
                        O sistema foi desenvolvido no contexto de um projeto
                        acadêmico e tem como objetivo facilitar o acesso a
                        informações sobre o parque, incluindo conteúdos
                        relacionados a trilhas, pontos de interesse, espécies,
                        mapas e outros recursos destinados à orientação e à
                        experiência dos visitantes.
                    </p>

                    <p>
                        Ao acessar ou utilizar o sistema, o usuário declara que
                        leu, compreendeu e concorda com as condições
                        estabelecidas neste Termo de Uso.
                    </p>

                    <p>
                        Caso não concorde com qualquer uma das disposições deste
                        documento, o usuário deverá interromper a utilização do
                        sistema.
                    </p>

                    <p>
                        O acesso público ao sistema não exige a criação de uma
                        conta de usuário. Determinadas funcionalidades,
                        destinadas exclusivamente à administração e manutenção
                        dos conteúdos, são restritas a usuários previamente
                        autorizados.
                    </p>

                    <p>
                        Caso o usuário seja menor de idade ou não possua
                        capacidade civil para utilizar o sistema de forma
                        independente, seu acesso deverá ocorrer sob a orientação
                        e responsabilidade de seus pais, responsáveis legais ou
                        acompanhantes.
                    </p>
                </section>

                <section>
                    <h2>2. Finalidade do Sistema</h2>

                    <p>
                        O sistema tem como finalidade disponibilizar informações
                        relacionadas ao Parque Natural Municipal Juqueriquerê,
                        contribuindo para a divulgação de seus espaços, trilhas,
                        pontos de interesse e demais conteúdos relacionados à
                        visitação.
                    </p>

                    <p>
                        As informações disponibilizadas possuem caráter
                        <strong> informativo e de apoio à visitação</strong> e
                        não substituem:
                    </p>

                    <ul>
                        <li>
                            orientações fornecidas pelos responsáveis pelo
                            parque;
                        </li>
                        <li>
                            sinalizações existentes no local;
                        </li>
                        <li>normas e regulamentos do parque;</li>
                        <li>
                            informações oficiais dos órgãos responsáveis;
                        </li>
                        <li>
                            orientações relacionadas à segurança dos visitantes.
                        </li>
                    </ul>

                    <p>
                        O usuário deve sempre observar as condições existentes
                        no local e seguir as orientações oficiais durante sua
                        visita.
                    </p>
                </section>

                <section>
                    <h2>3. Acesso à Área Administrativa</h2>

                    <p>
                        O sistema possui uma área administrativa destinada
                        exclusivamente a usuários autorizados.
                    </p>

                    <p>
                        Os administradores podem utilizar funcionalidades
                        específicas para criar, editar, atualizar, organizar ou
                        remover conteúdos disponibilizados no sistema, de acordo
                        com as permissões atribuídas à sua conta.
                    </p>

                    <p>
                        O acesso à área administrativa é protegido por
                        credenciais de autenticação.
                    </p>

                    <p>
                        O administrador é responsável por manter seus dados de
                        acesso em segurança e não deverá compartilhar sua senha
                        ou outras credenciais com terceiros.
                    </p>

                    <p>
                        O uso de uma conta administrativa por pessoa não
                        autorizada é proibido.
                    </p>

                    <p>
                        Caso o administrador identifique ou suspeite de acesso
                        não autorizado à sua conta, deverá comunicar o fato aos
                        responsáveis pelo sistema para que sejam adotadas as
                        medidas cabíveis.
                    </p>
                </section>

                <section>
                    <h2>4. Uso Adequado do Sistema</h2>

                    <p>
                        O usuário se compromete a utilizar o sistema de maneira
                        adequada, respeitando a legislação vigente, os direitos
                        de terceiros e as disposições deste Termo.
                    </p>

                    <p>É proibido utilizar o sistema para:</p>

                    <ol type="I">
                        <li>
                            praticar atividades ilícitas ou fraudulentas;
                        </li>
                        <li>
                            tentar obter acesso não autorizado a contas, áreas
                            restritas, servidores, bancos de dados ou outros
                            recursos do sistema;
                        </li>
                        <li>
                            interferir deliberadamente no funcionamento ou na
                            disponibilidade do sistema;
                        </li>
                        <li>
                            introduzir códigos maliciosos, vírus ou outros
                            mecanismos capazes de prejudicar o sistema ou seus
                            usuários;
                        </li>
                        <li>
                            utilizar informações ou recursos do sistema para
                            finalidade que viole direitos de terceiros ou a
                            legislação aplicável;
                        </li>
                        <li>
                            utilizar uma conta administrativa sem autorização.
                        </li>
                    </ol>
                </section>

                <section>
                    <h2>5. Conteúdos Disponibilizados no Sistema</h2>

                    <p>
                        Os conteúdos apresentados no sistema podem incluir
                        textos, imagens, mapas, informações sobre trilhas,
                        pontos de interesse, espécies e outros materiais
                        relacionados ao Parque Natural Municipal Juqueriquerê.
                    </p>

                    <p>
                        Os conteúdos poderão ser atualizados, corrigidos ou
                        modificados ao longo do desenvolvimento e da manutenção
                        do sistema.
                    </p>

                    <p>
                        Quando determinado conteúdo tiver origem ou titularidade
                        de terceiros, seus respectivos direitos permanecem
                        pertencentes aos seus titulares.
                    </p>

                    <p>
                        O sistema não pretende substituir fontes oficiais de
                        informação. Em caso de divergência entre informações
                        apresentadas no sistema e orientações oficiais do parque
                        ou dos órgãos responsáveis, deverão prevalecer as
                        informações oficiais.
                    </p>
                </section>

                <section>
                    <h2>6. Propriedade Intelectual</h2>

                    <p>
                        A estrutura do sistema, sua organização, código-fonte,
                        interface, componentes gráficos e demais elementos
                        desenvolvidos especificamente para o projeto estão
                        sujeitos à legislação aplicável de propriedade
                        intelectual.
                    </p>

                    <p>
                        O acesso ao sistema não concede ao usuário qualquer
                        direito de propriedade sobre seus elementos.
                    </p>

                    <p>
                        É proibida a reprodução, modificação, distribuição,
                        comercialização ou utilização não autorizada dos
                        elementos exclusivos do sistema, ressalvadas as
                        hipóteses permitidas pela legislação vigente.
                    </p>

                    <p>
                        Imagens, textos, marcas, símbolos, mapas e demais
                        conteúdos pertencentes a terceiros permanecem sujeitos
                        aos direitos de seus respectivos titulares.
                    </p>
                </section>

                <section>
                    <h2>7. Disponibilidade e Funcionamento</h2>

                    <p>
                        O sistema encontra-se sujeito a atualizações, correções,
                        manutenção e melhorias, podendo apresentar alterações em
                        suas funcionalidades ao longo do tempo.
                    </p>

                    <p>
                        Embora sejam adotados esforços para manter o sistema
                        disponível e funcionando adequadamente, não é possível
                        garantir que seu funcionamento será contínuo,
                        ininterrupto ou completamente livre de erros.
                    </p>

                    <p>
                        O acesso ou funcionamento do sistema também poderá ser
                        afetado por fatores externos, incluindo:
                    </p>

                    <ul>
                        <li>conexão com a internet;</li>
                        <li>características do dispositivo utilizado;</li>
                        <li>navegador;</li>
                        <li>sistema operacional;</li>
                        <li>serviços de terceiros;</li>
                        <li>falhas de infraestrutura;</li>
                        <li>
                            manutenção ou indisponibilidade temporária.
                        </li>
                    </ul>

                    <p>
                        Determinadas funcionalidades poderão ser temporariamente
                        suspensas ou modificadas quando necessário para
                        manutenção, segurança, correção de problemas ou evolução
                        do projeto.
                    </p>
                </section>

                <section>
                    <h2>8. Dados Pessoais e Privacidade</h2>

                    <p>
                        O acesso público aos conteúdos do sistema não exige a
                        criação de uma conta.
                    </p>

                    <p>
                        As contas administrativas são destinadas exclusivamente
                        aos usuários autorizados e podem envolver o tratamento
                        de dados pessoais, como <strong>nome completo,
                            endereço de e-mail, senha e, opcionalmente, foto de
                            perfil</strong>.
                    </p>

                    <p>
                        O tratamento desses dados é realizado de acordo com a
                        legislação aplicável, especialmente a
                        <strong> Lei nº 13.709/2018 — Lei Geral de Proteção de
                            Dados Pessoais (LGPD)</strong>.
                    </p>

                    <p>
                        As informações sobre o tratamento de dados pessoais
                        estão detalhadas na{" "}
                        <a href="/politica-de-privacidade">
                            Política de Privacidade
                        </a>{" "}
                        do sistema.
                    </p>
                </section>

                <section>
                    <h2>9. Segurança</h2>

                    <p>
                        São adotadas medidas técnicas e organizacionais
                        compatíveis com a natureza do sistema para contribuir
                        com a proteção das informações e das contas
                        administrativas.
                    </p>

                    <p>
                        Apesar dessas medidas, nenhum sistema conectado à
                        internet está completamente livre de riscos de
                        segurança.
                    </p>

                    <p>
                        O usuário também possui responsabilidade pela segurança
                        de suas credenciais, especialmente no caso das contas
                        administrativas.
                    </p>

                    <p>
                        O compartilhamento de senhas, o uso de credenciais de
                        terceiros ou outras práticas que comprometam a segurança
                        do sistema não são permitidos.
                    </p>
                </section>

                <section>
                    <h2>10. Limitação de Responsabilidade</h2>

                    <p>
                        O sistema é disponibilizado no contexto de um projeto
                        acadêmico desenvolvido por alunos do IFSP Câmpus
                        Caraguatatuba e pode estar sujeito a limitações
                        técnicas, alterações e aprimoramentos.
                    </p>

                    <p>
                        Na medida permitida pela legislação aplicável, os
                        responsáveis pelo desenvolvimento não garantem que o
                        sistema estará permanentemente disponível ou livre de
                        falhas e interrupções.
                    </p>

                    <p>
                        Os responsáveis pelo sistema não se responsabilizam por
                        prejuízos decorrentes exclusivamente de:
                    </p>

                    <ol type="I">
                        <li>
                            utilização inadequada ou indevida do sistema;
                        </li>
                        <li>
                            interpretação equivocada das informações
                            disponibilizadas;
                        </li>
                        <li>
                            indisponibilidade temporária do sistema;
                        </li>
                        <li>
                            falhas no dispositivo, navegador, conexão com a
                            internet ou serviços de terceiros;
                        </li>
                        <li>
                            utilização das informações do sistema em desacordo
                            com orientações oficiais do Parque Natural Municipal
                            Juqueriquerê;
                        </li>
                        <li>
                            eventos ou circunstâncias que estejam fora do
                            controle razoável dos responsáveis pelo sistema.
                        </li>
                    </ol>

                    <p>
                        Esta disposição não exclui ou limita responsabilidades
                        que não possam ser afastadas ou limitadas de acordo com
                        a legislação aplicável.
                    </p>
                </section>

                <section>
                    <h2>11. Alterações do Sistema</h2>

                    <p>
                        O sistema poderá ser atualizado, modificado,
                        aprimorado, temporariamente suspenso ou descontinuado,
                        total ou parcialmente, quando necessário.
                    </p>

                    <p>
                        As alterações poderão ocorrer em razão de manutenção,
                        correções técnicas, segurança, mudanças no projeto ou
                        outras necessidades relacionadas ao funcionamento do
                        sistema.
                    </p>

                    <p>
                        Sempre que houver alterações relevantes neste Termo de
                        Uso, uma nova versão será disponibilizada no sistema,
                        acompanhada da respectiva data de atualização.
                    </p>
                </section>

                <section>
                    <h2>12. Alterações deste Termo</h2>

                    <p>
                        Este Termo de Uso poderá ser atualizado sempre que
                        necessário, especialmente em razão de mudanças nas
                        funcionalidades do sistema, na forma de utilização dos
                        recursos ou na legislação aplicável.
                    </p>

                    <p>
                        A versão mais recente estará disponível no próprio
                        sistema.
                    </p>

                    <p>
                        Recomenda-se que o usuário consulte periodicamente este
                        documento para verificar eventuais alterações.
                    </p>

                    <p>
                        A continuidade de utilização do sistema após a
                        publicação de uma nova versão representa ciência das
                        alterações, ressalvados os direitos garantidos pela
                        legislação aplicável.
                    </p>
                </section>

                <section>
                    <h2>13. Disposições Finais</h2>

                    <p>
                        Este Termo de Uso é regido pela legislação vigente da
                        <strong> República Federativa do Brasil</strong>.
                    </p>

                    <p>
                        Este documento não substitui normas, regulamentos,
                        sinalizações, orientações ou determinações oficiais do
                        <strong> Parque Natural Municipal Juqueriquerê</strong>{" "}
                        ou dos órgãos públicos responsáveis por sua
                        administração.
                    </p>

                    <p>
                        Em caso de dúvidas relacionadas ao funcionamento do
                        sistema ou às condições de utilização, o usuário poderá
                        utilizar os canais de contato disponibilizados no
                        próprio sistema.
                    </p>

                    <p className="legalDate">
                        Caraguatatuba, 08 de abril de 2026.
                    </p>
                </section>
            </section>
        </>
    );
}