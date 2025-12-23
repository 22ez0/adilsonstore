import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Check, AlertCircle, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Warranty() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-3xl p-8 lg:p-12">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-10 h-10" />
              <h1 className="text-4xl lg:text-5xl font-bold">Garantia Adilson Store</h1>
            </div>
            <p className="text-lg text-blue-100 max-w-2xl">
              Proteção total para seus produtos. Garantia de qualidade, satisfação garantida e suporte técnico completo.
            </p>
          </div>
        </section>

        {/* Main Warranty Content */}
        <section className="max-w-4xl mx-auto space-y-8 mb-16">
          {/* Comprehensive Coverage */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="w-6 h-6 text-blue-600" />
                Cobertura Completa de Garantia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                A Adilson Store oferece uma garantia abrangente e segura para todos os produtos vendidos. Somos o seu parceiro confiável em tecnologia mobile, garantindo qualidade, durabilidade e total satisfação com suas compras.
              </p>
              
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="font-bold text-lg mb-4">Cobertura Padrão: 12 Meses</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Defeitos de fabricação e problemas técnicos</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Mau funcionamento de hardware e componentes internos</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Problemas na bateria e carregamento</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Falhas na câmera e sensores</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Problemas de conectividade e rede</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Tela com pixels mortos ou defeitosa</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Suporte técnico gratuito 24/7</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Reparo ou substituição sem custo</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                O que NÃO é Coberto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-slate-700">
                <li>• Danos causados por quedas, impactos ou acidentes</li>
                <li>• Danos por água ou líquidos (salvo componentes internos por defeito de fabricação)</li>
                <li>• Uso inadequado ou fora das especificações do fabricante</li>
                <li>• Danos cosméticos leves (arranhões, pequenos amassados)</li>
                <li>• Modificações ou reparos não autorizados</li>
                <li>• Bateria desgastada por uso normal (mais de 1000 ciclos)</li>
                <li>• Software ou perda de dados</li>
              </ul>
            </CardContent>
          </Card>

          {/* Satisfaction Guarantee */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Check className="w-6 h-6 text-green-600" />
                Garantia de Satisfação 100%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                Sua satisfação é nossa prioridade número um! Se por qualquer motivo você não ficar completamente satisfeito com seu produto, oferecemos as seguintes garantias:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    30 Dias - Devolvição Completa
                  </h4>
                  <p className="text-sm">Dentro de 30 dias da compra, você pode devolver o produto por qualquer razão e receber 100% do seu dinheiro de volta.</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Troca Sem Custo
                  </h4>
                  <p className="text-sm">Se o produto chegar com qualquer defeito, oferecemos troca imediata sem nenhum custo adicional para você.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Como Funciona a Garantia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Identifique o Problema</h4>
                    <p className="text-slate-600">Se notar qualquer defeito ou problema, entre em contato conosco imediatamente através de nossos canais de atendimento.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Suporte Técnico</h4>
                    <p className="text-slate-600">Nossa equipe técnica analisará seu caso e fornecerá assistência. A maioria dos problemas é resolvida remotamente em poucas horas.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Reparo ou Substituição</h4>
                    <p className="text-slate-600">Se necessário, enviaremos um produto de substituição ou reparo completo. Cobrimos todos os custos de envio.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Produto Restaurado</h4>
                    <p className="text-slate-600">Seu produto é devolvido completamente funcional, testado e com a garantia renovada pelo período restante.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Assurance */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-2xl">Compromisso com Qualidade</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                Todos os nossos produtos passam por rigorosos testes de qualidade antes de serem enviados. Garantimos:
              </p>
              
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>100% Originais:</strong> Todos os produtos são originais de fábrica, nunca usados ou refurbished.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bateria Nova:</strong> Bateria com 0% de desgaste, com ciclos de carregamento preservados.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Testes de Funcionamento:</strong> Cada device passa por testes completos de hardware e software.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Embalagem Intacta:</strong> Produtos chegam em embalagem lacrada do fabricante.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Garantia de Fabrica Transferível:</strong> A garantia oficial do fabricante também é válida.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Nosso time de suporte está disponível 24/7 para ajudar você com qualquer dúvida sobre a garantia:
              </p>
              
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
                <p><strong>Email:</strong> suporte@adilsonstore.com.br</p>
                <p><strong>WhatsApp:</strong> +55 (11) 99741-2331</p>
                <p><strong>Telefone:</strong> 0800-765-8812</p>
                <p><strong>Atendimento:</strong> Segunda a domingo, 24 horas por dia</p>
              </div>

              <p className="text-sm text-slate-600">
                Tempo médio de resposta: Menos de 1 hora durante o horário comercial e em até 4 horas nos demais períodos.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
