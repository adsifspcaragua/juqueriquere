import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from "../lib/hooks/usePageTitle.ts";

import Select from '../components/ui/form/Select.tsx';
import CardPonto from '../components/ui/CardPonto.tsx';
import { db, type PontoInteresseDB, type TrilhaDB } from '../lib/dexie.ts';
import '../components/styles/CardTrilha.css';
import '../components/styles/CardPonto.css';
import SimpleButton from '../components/ui/buttons/SimpleButton.tsx';

const ORDER_OPTIONS = {
	"Nome A-Z": (
		a: PontoInteresseDB,
		b: PontoInteresseDB
	) => (a.nome || "").localeCompare(b.nome || ""),

	"Nome Z-A": (
		a: PontoInteresseDB,
		b: PontoInteresseDB
	) => (b.nome || "").localeCompare(a.nome || ""),
} as const;

type OrderKey = keyof typeof ORDER_OPTIONS;

export default function Pontos() {
	usePageTitle("Pontos de Interesse");

	const [searchParams, setSearchParams] = useSearchParams();

	const trilhaParam = searchParams.get("trilha");

	const selectedTrilhaId =
		trilhaParam && trilhaParam !== "sem-trilha"
			? Number(trilhaParam)
			: null;

	const [orderKey, setOrderKey] = useState<OrderKey>("Nome A-Z");
	const [search, setSearch] = useState("");

	const [pontosDados, setPontosDados] = useState<PontoInteresseDB[]>([]);
	const [trilhasDados, setTrilhasDados] = useState<TrilhaDB[]>([]);

	useEffect(() => {
		async function carregarDados() {
			try {
				const [pontos, trilhas] = await Promise.all([
					db.pontos_interesse.toArray(),
					db.trilhas.toArray(),
				]);

				if (pontos) {
					setPontosDados(pontos);
				}

				if (trilhas) {
					setTrilhasDados(trilhas);
				}
			} catch (error) {
				console.error(
					"Erro ao carregar dados do banco:",
					error
				);
			}
		}

		carregarDados();
	}, []);

	const handleSetTrilhaParam = (val: string | null) => {
		setSearchParams((prev) => {
			const newParams = new URLSearchParams(prev);

			if (val !== null) {
				newParams.set("trilha", val);
			} else {
				newParams.delete("trilha");
			}

			return newParams;
		});
	};

	const trilhaSelecionada = useMemo(() => {
		if (
			!trilhaParam ||
			trilhaParam === "sem-trilha"
		) {
			return null;
		}

		return trilhasDados.find(
			(t) => t.id === Number(trilhaParam)
		);
	}, [trilhasDados, trilhaParam]);

	const ordemOptions = useMemo(() => {
		return Object.keys(ORDER_OPTIONS).map(
			(key) => `Ordem: ${key}`
		);
	}, []);

	const trilhaOptions = useMemo(() => {
		return [
			"Todas as trilhas",
			"Pontos sem trilha",
			...trilhasDados.map(
				(t) => `Trilha: ${t.nome}`
			),
		];
	}, [trilhasDados]);

	const handleOrderChange = (optionValue: string) => {
		const key = optionValue.replace(
			"Ordem: ",
			""
		) as OrderKey;

		setOrderKey(key);
	};

	const handleTrilhaChange = (optionValue: string) => {
		if (optionValue === "Todas as trilhas") {
			handleSetTrilhaParam(null);

			return;
		}

		if (optionValue === "Pontos sem trilha") {
			handleSetTrilhaParam("sem-trilha");

			return;
		}

		if (optionValue.startsWith("Trilha: ")) {
			const nomeTrilha = optionValue.replace(
				"Trilha: ",
				""
			);

			const trilha = trilhasDados.find(
				(t) => t.nome === nomeTrilha
			);

			if (trilha) {
				handleSetTrilhaParam(
					String(trilha.id)
				);
			}
		}
	};

	const pontosFiltrados = useMemo(() => {
		const termo = search.trim().toLowerCase();

		return pontosDados
			.filter((item) => {
				// Pesquisa pelo nome
				const bateNome = (
					item.nome || ""
				)
					.toLowerCase()
					.includes(termo);

				// Filtro por trilha
				let bateTrilha = true;

				if (trilhaParam === "sem-trilha") {
					bateTrilha = !item.trilha_id;
				} else if (trilhaParam) {
					bateTrilha =
						item.trilha_id ===
						Number(trilhaParam);
				}

				return bateNome && bateTrilha;
			})
			.sort(ORDER_OPTIONS[orderKey]);
	}, [
		pontosDados,
		search,
		trilhaParam,
		orderKey,
	]);

	const temFiltroAtivo = Boolean(
		search ||
		trilhaParam ||
		orderKey !== "Nome A-Z"
	);

	// =========================================================
	// VALOR DO SELECT MOBILE
	// =========================================================

	const valorSelectMobile = useMemo(() => {
		if (trilhaParam === "sem-trilha") {
			return "Pontos sem trilha";
		}

		if (trilhaSelecionada) {
			return `Trilha: ${trilhaSelecionada.nome}`;
		}

		return `Ordem: ${orderKey}`;
	}, [
		trilhaParam,
		trilhaSelecionada,
		orderKey,
	]);

	return (
		<>
			{createPortal(
				<div
					className="horizontal gap5 filtrosMobile"
					id="filtros"
				>
					<div className="pesquisa horizontal">
						<div className="pesquisaIcon"></div>

						<input
							type="text"
							placeholder="Pesquisar ponto..."
							value={search}
							onChange={(e) =>
								setSearch(e.target.value)
							}
						/>
					</div>

					<Select
						options={[
							"Todas as trilhas",
							"Pontos sem trilha",
							...ordemOptions,
							...trilhaOptions.slice(2),
						]}
						onChange={(value) => {
							if (
								value.startsWith(
									"Ordem: "
								)
							) {
								handleOrderChange(value);
							} else {
								handleTrilhaChange(value);
							}
						}}
						value={valorSelectMobile}
						compacto
						style="none"
					/>
				</div>,
				document.body
			)}

			<div className="paddingHeader2"></div>

			<section>
				<div className="conteudo vertical desktopWrap1-2">

					<div className="vertical gap15">

						<div
							className="img-fade"
							id="capivara"
						></div>

						<div className="info vertical gap5">
							<h1>Pontos</h1>

							<p>
								Descubra as espécies nativas
								do parque e aprenda mais sobre
								os seres que habitam esse espaço.
							</p>
						</div>

						<div className="vertical gap15 filtrosDesktop card right" id="filtros">
							<div className="pesquisa horizontal center w100">
								<div className="pesquisaIcon"></div>
								<input
									type="text"
									placeholder="Pesquisar ponto..."
									value={search}
									onChange={(e) =>
										setSearch(e.target.value)
									}
								/>
							</div>
								
							<div className="vertical gap5 right">
								<div className="horizontal gap5 center">
									<p>Exibir pontos em: </p>
									<Select
										options={trilhaOptions}
										onChange={handleTrilhaChange}
										value={
											trilhaParam ===
												"sem-trilha"
												? "Pontos sem trilha"
												: trilhaSelecionada
													? `${trilhaSelecionada.nome}`
													: "Todas as trilhas"
										}
										style="none"
										icon='select'
									/>
								</div>
								
								<div className="horizontal gap5 center">
									<p>Ordenar por: </p>
									<Select
										options={ordemOptions}
										onChange={handleOrderChange}
										value={`${orderKey}`}
										style="none"
										icon='select'
									/>
								</div>
							</div>

							{temFiltroAtivo && (
								<>
								<div className="linhaHorizontalDark"></div>
								<div className="vertical gap15 w100">

									<h4>Filtros aplicados:</h4>

									<div className="vertical gap5">
										{/* BUSCA */}
										{search && (
											<div className="horizontal gap5 justify center">
												<SimpleButton
													tema="light"
													icon="X"
													onClick={() =>
														setSearch("")
													}
												>
													Busca: "{search}"
												</SimpleButton>
											</div>
										)}
										{/* TRILHA */}
										{trilhaParam && (
											<div className="horizontal gap5 justify center">
												<SimpleButton
													tema="light"
													icon="X"
													onClick={() =>
														handleSetTrilhaParam(
															null
														)
													}
												>
													{trilhaParam ===
													"sem-trilha"
													? "Pontos sem trilha"
													: trilhaSelecionada
														? `Trilha: ${trilhaSelecionada.nome}`
														: "Trilha selecionada"}
												</SimpleButton>
											</div>
										)}
									</div>

									{/* LIMPAR TUDO */}

									<SimpleButton
										tema="dark"
										icon="Trash"
										raio='10'
										onClick={() => {
											setSearch("");
											handleSetTrilhaParam(
												null
											);
											setOrderKey(
												"Nome A-Z"
											);
										}}
									>
										Limpar filtros
									</SimpleButton>

								</div>
								</>
							)}
						</div>
					</div>

					{/* =================================================
						LISTA DE PONTOS
					================================================= */}

					<div className="lista vertical">

						<p>
							Exibindo{" "}
							{pontosFiltrados.length}{" "}
							pontos
						</p>

						<div className="listaGrid">

							{pontosFiltrados.map((item) => (
								<CardPonto
									key={item.id}
									ponto={item}
									trilhaId={item.trilha_id}
								/>
							))}

						</div>

					</div>

				</div>
			</section>

			{/* =====================================================
				ESPAÇAMENTO DO FOOTER
			===================================================== */}

			{createPortal(
				<div className="paddingFooter"></div>,
				document.body
			)}
		</>
	);
}